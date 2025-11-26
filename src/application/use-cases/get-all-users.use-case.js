const UserMapper = require('../mappers/user.mapper');

/**
 * GetAllUsers Use Case
 */
class GetAllUsersUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute() {
        const users = await this.userRepository.findAll();
        return users.map(user => UserMapper.toDTO(user));
    }
}

module.exports = GetAllUsersUseCase;
