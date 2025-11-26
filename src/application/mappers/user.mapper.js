const UserDTO = require('../../domain/dtos/user.dto');
const UserEntity = require('../../domain/entities/user.entity');

/**
 * User Mapper
 * Transforms data between Domain Entities and DTOs.
 */
class UserMapper {
    static toDTO(userEntity) {
        return new UserDTO(
            userEntity.id,
            userEntity.name,
            userEntity.email,
            userEntity.role
        );
    }

    static toEntity(data) {
        return new UserEntity(
            data.id,
            data.name,
            data.email,
            data.role,
            data.createdAt
        );
    }
}

module.exports = UserMapper;
