/**
 * UserRepository Interface (Port)
 * Defines the contract that any concrete repository must implement.
 * The Application layer depends on this abstraction, not the implementation.
 */
class UserRepositoryInterface {
    async create(userEntity) {
        throw new Error('Method not implemented');
    }

    async findAll() {
        throw new Error('Method not implemented');
    }

    async findById(id) {
        throw new Error('Method not implemented');
    }
}

module.exports = UserRepositoryInterface;
