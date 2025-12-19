const { v4: uuidv4 } = require('uuid');
const Group = require('./Group');
const User = require('./User');

// In-memory storage for settlements
const settlements = new Map();

class Settlement {
    constructor(groupId, fromUserId, toUserId, amount) {
        this.id = uuidv4();
        this.groupId = groupId;
        this.fromUserId = fromUserId;
        this.toUserId = toUserId;
        this.amount = parseFloat(amount);
        this.createdAt = new Date();
    }

    static create(groupId, fromUserId, toUserId, amount) {
        // Validate group exists
        if (!Group.exists(groupId)) {
            throw new Error('Group not found');
        }

        // Validate both users are members
        if (!Group.isMember(groupId, fromUserId)) {
            throw new Error('Payer is not a member of the group');
        }
        if (!Group.isMember(groupId, toUserId)) {
            throw new Error('Recipient is not a member of the group');
        }

        // Validate amount is positive
        if (parseFloat(amount) <= 0) {
            throw new Error('Settlement amount must be positive');
        }

        const settlement = new Settlement(groupId, fromUserId, toUserId, amount);
        settlements.set(settlement.id, settlement);
        return settlement;
    }

    static getById(id) {
        return settlements.get(id) || null;
    }

    static getByGroupId(groupId) {
        return Array.from(settlements.values()).filter(s => s.groupId === groupId);
    }

    static delete(id) {
        return settlements.delete(id);
    }

    static getAll() {
        return Array.from(settlements.values());
    }
}

module.exports = Settlement;
