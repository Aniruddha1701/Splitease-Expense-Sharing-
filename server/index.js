require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { generateToken, protect, optionalAuth } = require('./middleware/auth');
const { sendEmail, emailTemplates } = require('./config/email');
const { createPaymentIntent, createCheckoutSession } = require('./config/stripe');

// Import Mongoose Models
const User = require('./schemas/User');
const Group = require('./schemas/Group');
const Expense = require('./schemas/Expense');
const Settlement = require('./schemas/Settlement');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB().then(() => {
    // Seed demo user for "Try Demo Mode"
    seedDemoUser();
});

// Create demo user if not exists
async function seedDemoUser() {
    try {
        const demoEmail = 'demo@splitease.app';
        const existingDemo = await User.findOne({ email: demoEmail });

        if (!existingDemo) {
            await User.create({
                name: 'Demo User',
                email: demoEmail,
                isVerified: true
            });
            console.log('✅ Demo user created: demo@splitease.app');
        }
    } catch (error) {
        console.log('Demo user already exists or error:', error.message);
    }
}

// ==================== AUTH ROUTES ====================

// Register new user
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Create user
        const user = await User.create({ name, email, password });
        const token = generateToken(user._id);

        // Send welcome email (non-blocking)
        sendEmail(
            email,
            emailTemplates.welcome(name).subject,
            emailTemplates.welcome(name).html
        ).catch(err => console.log('Email failed:', err.message));

        res.status(201).json({
            user: { id: user._id, name: user.name, email: user.email },
            token
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user with password
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password (if password exists)
        if (user.password) {
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
        }

        const token = generateToken(user._id);

        res.json({
            user: { id: user._id, name: user.name, email: user.email },
            token
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Switch account (allows switching without password for authenticated users)
app.post('/api/auth/switch', protect, async (req, res) => {
    try {
        const { userId } = req.body;

        // Find the target user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate new token for the target user
        const token = generateToken(user._id);

        res.json({
            user: { id: user._id, name: user.name, email: user.email },
            token,
            message: 'Account switched successfully'
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get current user
app.get('/api/auth/me', protect, async (req, res) => {
    res.json(req.user);
});

// ==================== USER ROUTES ====================

// Create user (quick add without password)
app.post('/api/users', async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const user = await User.create({ name, email });
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all users
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Check user by email (for adding to groups)
app.get('/api/users/email/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ error: 'User not found', exists: false });
        }
        res.json({
            exists: true,
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get user's balance summary
app.get('/api/users/:id/balances', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get all groups user is a member of
        const groups = await Group.find({ members: userId });

        let totalOwed = 0;
        let totalOwes = 0;
        const details = [];

        for (const group of groups) {
            const balances = await calculateGroupBalances(group._id);

            for (const balance of balances) {
                if (balance.from._id.toString() === userId) {
                    totalOwes += balance.amount;
                    details.push({
                        groupId: group._id,
                        groupName: group.name,
                        type: 'OWES',
                        otherUser: { id: balance.to._id, name: balance.to.name },
                        amount: balance.amount
                    });
                } else if (balance.to._id.toString() === userId) {
                    totalOwed += balance.amount;
                    details.push({
                        groupId: group._id,
                        groupName: group.name,
                        type: 'OWED',
                        otherUser: { id: balance.from._id, name: balance.from.name },
                        amount: balance.amount
                    });
                }
            }
        }

        res.json({
            userId,
            userName: user.name,
            totalOwed: Math.round(totalOwed * 100) / 100,
            totalOwes: Math.round(totalOwes * 100) / 100,
            netBalance: Math.round((totalOwed - totalOwes) * 100) / 100,
            details
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ==================== GROUP ROUTES ====================

// Create group
app.post('/api/groups', async (req, res) => {
    try {
        const { name, createdBy, description, category } = req.body;
        if (!name || !createdBy) {
            return res.status(400).json({ error: 'Name and createdBy are required' });
        }

        const group = await Group.create({
            name,
            description,
            category,
            createdBy,
            members: [createdBy]
        });

        res.status(201).json(group);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all groups
app.get('/api/groups', async (req, res) => {
    try {
        const groups = await Group.find()
            .populate('members', 'name email')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
        res.json(groups);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get group by ID
app.get('/api/groups/:id', async (req, res) => {
    try {
        const group = await Group.findById(req.params.id)
            .populate('members', 'name email')
            .populate('createdBy', 'name email');

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        res.json({
            ...group.toObject(),
            memberDetails: group.members
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Add member to group
app.post('/api/groups/:id/members', async (req, res) => {
    try {
        const { userId } = req.body;
        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        if (group.members.includes(userId)) {
            return res.status(400).json({ error: 'User is already a member' });
        }

        group.members.push(userId);
        await group.save();

        const updatedGroup = await Group.findById(req.params.id)
            .populate('members', 'name email');

        res.json(updatedGroup);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get group balances
app.get('/api/groups/:id/balances', async (req, res) => {
    try {
        const balances = await calculateGroupBalances(req.params.id);
        res.json(balances);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get group expenses
app.get('/api/groups/:id/expenses', async (req, res) => {
    try {
        const expenses = await Expense.find({ group: req.params.id })
            .populate('paidBy', 'name email')
            .populate('splits.user', 'name email')
            .sort({ createdAt: -1 });
        res.json(expenses);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get group settlements
app.get('/api/groups/:id/settlements', async (req, res) => {
    try {
        const settlements = await Settlement.find({ group: req.params.id })
            .populate('fromUser', 'name email')
            .populate('toUser', 'name email')
            .sort({ createdAt: -1 });
        res.json(settlements);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ==================== EXPENSE ROUTES ====================

// Create expense
app.post('/api/expenses', async (req, res) => {
    try {
        const { groupId, description, amount, paidBy, splitType, splits, category, notes } = req.body;

        if (!groupId || !description || !amount || !paidBy || !splitType || !splits) {
            return res.status(400).json({
                error: 'groupId, description, amount, paidBy, splitType, and splits are required'
            });
        }

        // Validate and calculate splits
        const calculatedSplits = calculateSplits(parseFloat(amount), splitType, splits);

        const expense = await Expense.create({
            group: groupId,
            description,
            amount: parseFloat(amount),
            paidBy,
            splitType,
            splits: calculatedSplits,
            category,
            notes
        });

        const populatedExpense = await Expense.findById(expense._id)
            .populate('paidBy', 'name email')
            .populate('splits.user', 'name email');

        // Send email notification (non-blocking)
        const group = await Group.findById(groupId).populate('members', 'email');
        const payer = await User.findById(paidBy);
        if (group && payer) {
            group.members.forEach(member => {
                if (member._id.toString() !== paidBy) {
                    sendEmail(
                        member.email,
                        emailTemplates.expenseAdded(group.name, description, amount, payer.name).subject,
                        emailTemplates.expenseAdded(group.name, description, amount, payer.name).html
                    ).catch(err => console.log('Email failed:', err.message));
                }
            });
        }

        res.status(201).json(populatedExpense);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete expense
app.delete('/api/expenses/:id', async (req, res) => {
    try {
        const expense = await Expense.findByIdAndDelete(req.params.id);
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ==================== SETTLEMENT ROUTES ====================

// Create settlement
app.post('/api/settlements', async (req, res) => {
    try {
        const { groupId, fromUserId, toUserId, amount, method, notes } = req.body;

        if (!groupId || !fromUserId || !toUserId || !amount) {
            return res.status(400).json({
                error: 'groupId, fromUserId, toUserId, and amount are required'
            });
        }

        const settlement = await Settlement.create({
            group: groupId,
            fromUser: fromUserId,
            toUser: toUserId,
            amount: parseFloat(amount),
            method: method || 'cash',
            notes
        });

        const populatedSettlement = await Settlement.findById(settlement._id)
            .populate('fromUser', 'name email')
            .populate('toUser', 'name email');

        res.status(201).json(populatedSettlement);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete settlement
app.delete('/api/settlements/:id', async (req, res) => {
    try {
        const settlement = await Settlement.findByIdAndDelete(req.params.id);
        if (!settlement) {
            return res.status(404).json({ error: 'Settlement not found' });
        }
        res.json({ message: 'Settlement deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ==================== PAYMENT ROUTES (Stripe) ====================

// Create payment intent
app.post('/api/payments/create-intent', async (req, res) => {
    try {
        const { amount, groupId, fromUserId, toUserId } = req.body;

        const paymentIntent = await createPaymentIntent(amount, 'inr', {
            groupId,
            fromUserId,
            toUserId
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Create checkout session
app.post('/api/payments/checkout', async (req, res) => {
    try {
        const { amount, groupId, fromUserId, toUserId, successUrl, cancelUrl } = req.body;

        const session = await createCheckoutSession(
            amount,
            successUrl || `${req.headers.origin}/success`,
            cancelUrl || `${req.headers.origin}/cancel`,
            { groupId, fromUserId, toUserId }
        );

        res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ==================== HELPER FUNCTIONS ====================

// Calculate splits based on type
function calculateSplits(amount, splitType, splits) {
    if (!splits || splits.length === 0) {
        throw new Error('At least one split is required');
    }

    switch (splitType) {
        case 'EQUAL':
            const perPerson = amount / splits.length;
            return splits.map(s => ({
                user: s.userId,
                amount: Math.round(perPerson * 100) / 100
            }));

        case 'EXACT':
            const exactTotal = splits.reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);
            if (Math.abs(exactTotal - amount) > 0.01) {
                throw new Error(`Exact amounts (${exactTotal}) must equal total (${amount})`);
            }
            return splits.map(s => ({
                user: s.userId,
                amount: parseFloat(s.amount)
            }));

        case 'PERCENTAGE':
            const percentTotal = splits.reduce((sum, s) => sum + parseFloat(s.percentage || 0), 0);
            if (Math.abs(percentTotal - 100) > 0.01) {
                throw new Error(`Percentages (${percentTotal}%) must sum to 100%`);
            }
            return splits.map(s => ({
                user: s.userId,
                percentage: parseFloat(s.percentage),
                amount: Math.round((amount * parseFloat(s.percentage) / 100) * 100) / 100
            }));

        default:
            throw new Error('Invalid split type');
    }
}

// Calculate group balances
async function calculateGroupBalances(groupId) {
    const group = await Group.findById(groupId).populate('members', 'name email');
    if (!group) throw new Error('Group not found');

    const memberIds = group.members.map(m => m._id.toString());
    const balances = {};

    // Initialize
    memberIds.forEach(id => {
        balances[id] = {};
        memberIds.forEach(otherId => {
            if (id !== otherId) balances[id][otherId] = 0;
        });
    });

    // Process expenses
    const expenses = await Expense.find({ group: groupId });
    for (const expense of expenses) {
        const paidById = expense.paidBy.toString();
        for (const split of expense.splits) {
            const splitUserId = split.user.toString();
            if (splitUserId !== paidById && balances[splitUserId]) {
                balances[splitUserId][paidById] = (balances[splitUserId][paidById] || 0) + split.amount;
            }
        }
    }

    // Process settlements
    const settlements = await Settlement.find({ group: groupId, status: 'completed' });
    for (const settlement of settlements) {
        const fromId = settlement.fromUser.toString();
        const toId = settlement.toUser.toString();
        if (balances[fromId] && balances[fromId][toId] !== undefined) {
            balances[fromId][toId] -= settlement.amount;
        }
    }

    // Simplify and format
    const simplified = [];
    const processed = new Set();

    for (const fromId of memberIds) {
        for (const toId of memberIds) {
            if (fromId === toId) continue;
            const pairKey = [fromId, toId].sort().join('-');
            if (processed.has(pairKey)) continue;
            processed.add(pairKey);

            const aOwesB = balances[fromId]?.[toId] || 0;
            const bOwesA = balances[toId]?.[fromId] || 0;
            const net = aOwesB - bOwesA;

            if (Math.abs(net) > 0.01) {
                const fromUser = group.members.find(m => m._id.toString() === (net > 0 ? fromId : toId));
                const toUser = group.members.find(m => m._id.toString() === (net > 0 ? toId : fromId));

                simplified.push({
                    from: { _id: fromUser._id, id: fromUser._id, name: fromUser.name },
                    to: { _id: toUser._id, id: toUser._id, name: toUser.name },
                    amount: Math.round(Math.abs(net) * 100) / 100
                });
            }
        }
    }

    return simplified;
}

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        database: 'MongoDB Connected'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 SplitEase API running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
