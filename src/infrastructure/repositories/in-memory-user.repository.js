const UserRepositoryInterface = require('../../application/ports/repositories/user.repository.interface');
const UserEntity = require('../../domain/entities/user.entity');

/**
 * InMemoryUserRepository
 * Concrete implementation of the UserRepositoryInterface.
 * In a real app, this would use Prisma, Mongoose, or TypeORM.
 */
class InMemoryUserRepository extends UserRepositoryInterface {
    constructor() {
        super();
        this.users = [];
        this.currentId = 1;
    }

    async create(userEntity) {
        // Simulate DB persistence
        const newUser = {
            ...userEntity,
            id: this.currentId++,
        };
        this.users.push(newUser);

        // Return domain entity (re-hydrated from DB record)
        return new UserEntity(newUser.id, newUser.name, newUser.email, newUser.role, newUser.createdAt);
    }

    async findAll() {
        return this.users.map(u => new UserEntity(u.id, u.name, u.email, u.role, u.createdAt));
    }

    async findById(id) {
        const user = this.users.find(u => u.id === parseInt(id));
        if (!user) return null;
        return new UserEntity(user.id, user.name, user.email, user.role, user.createdAt);
    }
}

module.exports = InMemoryUserRepository;
