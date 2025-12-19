const mongoose = require('mongoose');

const splitSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    percentage: {
        type: Number,
        min: 0,
        max: 100
    }
}, { _id: false });

const expenseSchema = new mongoose.Schema({
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0.01, 'Amount must be greater than 0']
    },
    paidBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    splitType: {
        type: String,
        enum: ['EQUAL', 'EXACT', 'PERCENTAGE'],
        default: 'EQUAL'
    },
    splits: [splitSchema],
    category: {
        type: String,
        enum: ['food', 'transport', 'shopping', 'entertainment', 'utilities', 'rent', 'travel', 'other'],
        default: 'other'
    },
    notes: {
        type: String,
        default: ''
    },
    receipt: {
        type: String,
        default: null
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Pre-save middleware to calculate splits
expenseSchema.pre('save', function (next) {
    if (this.splitType === 'EQUAL' && this.splits.length > 0) {
        const perPerson = this.amount / this.splits.length;
        this.splits = this.splits.map(split => ({
            ...split,
            amount: Math.round(perPerson * 100) / 100
        }));
    }
    next();
});

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
