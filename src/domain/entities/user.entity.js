/**
 * User Entity
 * Core domain object. Contains business rules and state.
 */
class UserEntity {
    constructor(id, name, email, role, createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.createdAt = createdAt || new Date();
    }

    // Example domain logic
    isAdmin() {
        return this.role === 'admin';
    }
}

module.exports = UserEntity;
