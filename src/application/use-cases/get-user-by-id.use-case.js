const UserMapper = require('../mappers/user.mapper');

/**
 * GetUserById Use Case
 */
class GetUserByIdUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(id) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        return UserMapper.toDTO(user);
    }
}

module.exports = GetUserByIdUseCase;
