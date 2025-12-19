const { v4: uuidv4 } = require('uuid');
const User = require('./User');

// In-memory storage for groups
const groups = new Map();

class Group {
    constructor(name, createdBy) {
        this.id = uuidv4();
        this.name = name;
        this.members = [createdBy]; // Creator is automatically a member
        this.createdBy = createdBy;
        this.createdAt = new Date();
    }

    static create(name, createdBy) {
        if (!User.exists(createdBy)) {
            throw new Error('Creator user does not exist');
        }
        const group = new Group(name, createdBy);
        groups.set(group.id, group);
        return group;
    }

    static getAll() {
        return Array.from(groups.values());
    }

    static getById(id) {
        return groups.get(id) || null;
    }

    static getByIdWithMembers(id) {
        const group = groups.get(id);
        if (!group) return null;

        // Enrich with member details
        const memberDetails = group.members.map(memberId => {
            const user = User.getById(memberId);
            return user ? { id: user.id, name: user.name, email: user.email } : null;
        }).filter(Boolean);

        return {
            ...group,
            memberDetails
        };
    }

    static addMember(groupId, userId) {
        const group = groups.get(groupId);
        if (!group) {
            throw new Error('Group not found');
        }
        if (!User.exists(userId)) {
            throw new Error('User does not exist');
        }
        if (group.members.includes(userId)) {
            throw new Error('User is already a member of this group');
        }
        group.members.push(userId);
        return group;
    }

    static removeMember(groupId, userId) {
        const group = groups.get(groupId);
        if (!group) {
            throw new Error('Group not found');
        }
        if (group.createdBy === userId) {
            throw new Error('Cannot remove the group creator');
        }
        const index = group.members.indexOf(userId);
        if (index === -1) {
            throw new Error('User is not a member of this group');
        }
        group.members.splice(index, 1);
        return group;
    }

    static delete(id) {
        return groups.delete(id);
    }

    static exists(id) {
        return groups.has(id);
    }

    static isMember(groupId, userId) {
        const group = groups.get(groupId);
        return group ? group.members.includes(userId) : false;
    }

    static getUserGroups(userId) {
        return Array.from(groups.values()).filter(group =>
            group.members.includes(userId)
        );
    }
}

module.exports = Group;
