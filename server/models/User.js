const { v4: uuidv4 } = require('uuid');

// In-memory storage for users
const users = new Map();

class User {
    constructor(name, email) {
        this.id = uuidv4();
        this.name = name;
        this.email = email;
        this.createdAt = new Date();
    }

    static create(name, email) {
        // Check if email already exists
        for (const user of users.values()) {
            if (user.email === email) {
                throw new Error('Email already exists');
            }
        }
        const user = new User(name, email);
        users.set(user.id, user);
        return user;
    }

    static getAll() {
        return Array.from(users.values());
    }

    static getById(id) {
        return users.get(id) || null;
    }

    static getByEmail(email) {
        for (const user of users.values()) {
            if (user.email === email) {
                return user;
            }
        }
        return null;
    }

    static delete(id) {
        return users.delete(id);
    }

    static exists(id) {
        return users.has(id);
    }
}

module.exports = User;
