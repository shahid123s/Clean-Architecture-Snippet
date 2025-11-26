const UserEntity = require('../../domain/entities/user.entity');
const UserMapper = require('../mappers/user.mapper');

/**
 * CreateUser Use Case
 * Application business rules.
 */
class CreateUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(data) {
        const { name, email, role } = data;

        if (!name || !email) {
            throw new Error('Name and email are required');
        }

        // Create Entity
        const newUserEntity = new UserEntity(null, name, email, role || 'user');

        // Persist using Repository Port
        const createdUser = await this.userRepository.create(newUserEntity);

        // Return DTO
        return UserMapper.toDTO(createdUser);
    }
}

module.exports = CreateUserUseCase;
