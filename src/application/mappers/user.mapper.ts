import { UserEntity } from '../../domain/entities/user.entity';
import { UserDTO } from '../../domain/dtos/user.dto';

export class UserMapper {
    static toDTO(userEntity: UserEntity): UserDTO {
        return new UserDTO(
            userEntity.id,
            userEntity.name,
            userEntity.email,
            userEntity.role
        );
    }

    static toEntity(data: any): UserEntity {
        return new UserEntity(
            data.id,
            data.name,
            data.email,
            data.role
        );
    }
}
