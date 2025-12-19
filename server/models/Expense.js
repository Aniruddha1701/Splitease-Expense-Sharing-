const { v4: uuidv4 } = require('uuid');
const Group = require('./Group');
const User = require('./User');

// In-memory storage for expenses
const expenses = new Map();

// Split types
const SPLIT_TYPES = {
    EQUAL: 'EQUAL',
    EXACT: 'EXACT',
    PERCENTAGE: 'PERCENTAGE'
};

class Expense {
    constructor(groupId, description, amount, paidBy, splitType, splits) {
        this.id = uuidv4();
        this.groupId = groupId;
        this.description = description;
        this.amount = parseFloat(amount);
        this.paidBy = paidBy;
        this.splitType = splitType;
        this.splits = splits; // Array of { userId, amount?, percentage? }
        this.createdAt = new Date();
    }

    static validateSplits(amount, splitType, splits) {
        if (!splits || splits.length === 0) {
            throw new Error('At least one split is required');
        }

        switch (splitType) {
            case SPLIT_TYPES.EQUAL:
                // For equal split, we just need the user IDs
                return splits.map(split => ({
                    userId: split.userId,
                    amount: amount / splits.length
                }));

            case SPLIT_TYPES.EXACT:
                // Validate that exact amounts sum to total
                const exactTotal = splits.reduce((sum, split) => sum + parseFloat(split.amount || 0), 0);
                if (Math.abs(exactTotal - amount) > 0.01) {
                    throw new Error(`Exact split amounts (${exactTotal}) must equal total expense (${amount})`);
                }
                return splits.map(split => ({
                    userId: split.userId,
                    amount: parseFloat(split.amount)
                }));

            case SPLIT_TYPES.PERCENTAGE:
                // Validate that percentages sum to 100
                const percentTotal = splits.reduce((sum, split) => sum + parseFloat(split.percentage || 0), 0);
                if (Math.abs(percentTotal - 100) > 0.01) {
                    throw new Error(`Percentages (${percentTotal}%) must sum to 100%`);
                }
                return splits.map(split => ({
                    userId: split.userId,
                    percentage: parseFloat(split.percentage),
                    amount: (amount * parseFloat(split.percentage)) / 100
                }));

            default:
                throw new Error('Invalid split type. Must be EQUAL, EXACT, or PERCENTAGE');
        }
    }

    static create(groupId, description, amount, paidBy, splitType, splits) {
        // Validate group exists
        if (!Group.exists(groupId)) {
            throw new Error('Group not found');
        }

        // Validate payer is a member
        if (!Group.isMember(groupId, paidBy)) {
            throw new Error('Payer must be a member of the group');
        }

        // Validate all split users are members
        for (const split of splits) {
            if (!Group.isMember(groupId, split.userId)) {
                throw new Error(`User ${split.userId} is not a member of the group`);
            }
        }

        // Validate and calculate splits
        const calculatedSplits = Expense.validateSplits(parseFloat(amount), splitType, splits);

        const expense = new Expense(groupId, description, amount, paidBy, splitType, calculatedSplits);
        expenses.set(expense.id, expense);
        return expense;
    }

    static getById(id) {
        return expenses.get(id) || null;
    }

    static getByGroupId(groupId) {
        return Array.from(expenses.values()).filter(expense => expense.groupId === groupId);
    }

    static delete(id) {
        return expenses.delete(id);
    }

    static getAll() {
        return Array.from(expenses.values());
    }
}

Expense.SPLIT_TYPES = SPLIT_TYPES;

module.exports = Expense;
