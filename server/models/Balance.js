const Expense = require('./Expense');
const Settlement = require('./Settlement');
const Group = require('./Group');
const User = require('./User');

class Balance {
    /**
     * Calculate all balances for a group
     * Returns a map of who owes whom and how much
     */
    static calculateGroupBalances(groupId) {
        const group = Group.getById(groupId);
        if (!group) {
            throw new Error('Group not found');
        }

        // balances[fromUserId][toUserId] = amount that fromUser owes toUser
        const balances = {};

        // Initialize balances for all members
        for (const memberId of group.members) {
            balances[memberId] = {};
            for (const otherMemberId of group.members) {
                if (memberId !== otherMemberId) {
                    balances[memberId][otherMemberId] = 0;
                }
            }
        }

        // Process all expenses in the group
        const expenses = Expense.getByGroupId(groupId);
        for (const expense of expenses) {
            const paidBy = expense.paidBy;

            for (const split of expense.splits) {
                if (split.userId !== paidBy) {
                    // split.userId owes paidBy the split.amount
                    balances[split.userId][paidBy] += split.amount;
                }
            }
        }

        // Process all settlements in the group
        const settlements = Settlement.getByGroupId(groupId);
        for (const settlement of settlements) {
            // fromUser paid toUser, so reduce what fromUser owes toUser
            balances[settlement.fromUserId][settlement.toUserId] -= settlement.amount;
        }

        // Simplify: Net out mutual debts
        const simplifiedBalances = this.simplifyBalances(balances, group.members);

        return simplifiedBalances;
    }

    /**
     * Simplify balances by netting out mutual debts
     * If A owes B $50 and B owes A $30, then A owes B $20
     */
    static simplifyBalances(balances, members) {
        const simplified = [];

        const processed = new Set();

        for (const fromUser of members) {
            for (const toUser of members) {
                if (fromUser === toUser) continue;

                const pairKey = [fromUser, toUser].sort().join('-');
                if (processed.has(pairKey)) continue;
                processed.add(pairKey);

                const aOwesB = balances[fromUser]?.[toUser] || 0;
                const bOwesA = balances[toUser]?.[fromUser] || 0;

                const netAmount = aOwesB - bOwesA;

                if (Math.abs(netAmount) > 0.01) {
                    if (netAmount > 0) {
                        // fromUser owes toUser
                        simplified.push({
                            from: fromUser,
                            to: toUser,
                            amount: Math.round(netAmount * 100) / 100
                        });
                    } else {
                        // toUser owes fromUser
                        simplified.push({
                            from: toUser,
                            to: fromUser,
                            amount: Math.round(Math.abs(netAmount) * 100) / 100
                        });
                    }
                }
            }
        }

        return simplified;
    }

    /**
     * Get a user's balance summary across all groups or a specific group
     */
    static getUserBalanceSummary(userId, groupId = null) {
        const user = User.getById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        let groupsToProcess = [];
        if (groupId) {
            const group = Group.getById(groupId);
            if (!group) {
                throw new Error('Group not found');
            }
            groupsToProcess = [group];
        } else {
            groupsToProcess = Group.getUserGroups(userId);
        }

        let totalOwed = 0;  // What others owe this user
        let totalOwes = 0;  // What this user owes others
        const details = [];

        for (const group of groupsToProcess) {
            const balances = this.calculateGroupBalances(group.id);

            for (const balance of balances) {
                const fromUser = User.getById(balance.from);
                const toUser = User.getById(balance.to);

                if (balance.from === userId) {
                    // This user owes someone
                    totalOwes += balance.amount;
                    details.push({
                        groupId: group.id,
                        groupName: group.name,
                        type: 'OWES',
                        otherUser: toUser ? { id: toUser.id, name: toUser.name } : null,
                        amount: balance.amount
                    });
                } else if (balance.to === userId) {
                    // Someone owes this user
                    totalOwed += balance.amount;
                    details.push({
                        groupId: group.id,
                        groupName: group.name,
                        type: 'OWED',
                        otherUser: fromUser ? { id: fromUser.id, name: fromUser.name } : null,
                        amount: balance.amount
                    });
                }
            }
        }

        return {
            userId,
            userName: user.name,
            totalOwed: Math.round(totalOwed * 100) / 100,
            totalOwes: Math.round(totalOwes * 100) / 100,
            netBalance: Math.round((totalOwed - totalOwes) * 100) / 100,
            details
        };
    }

    /**
     * Get detailed balances for a group with user names
     */
    static getGroupBalancesWithDetails(groupId) {
        const balances = this.calculateGroupBalances(groupId);

        return balances.map(balance => {
            const fromUser = User.getById(balance.from);
            const toUser = User.getById(balance.to);

            return {
                from: {
                    id: balance.from,
                    name: fromUser ? fromUser.name : 'Unknown'
                },
                to: {
                    id: balance.to,
                    name: toUser ? toUser.name : 'Unknown'
                },
                amount: balance.amount
            };
        });
    }
}

module.exports = Balance;
