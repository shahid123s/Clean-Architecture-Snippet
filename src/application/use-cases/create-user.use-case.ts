import { IUserRepository } from '../ports/repositories/user.repository.interface';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';
import { UserDTO } from '../../domain/dtos/user.dto';

interface CreateUserRequest {
    name: string;
    email: string;
    role?: string;
}

export class CreateUserUseCase {
    constructor(private readonly userRepository: IUserRepository) { }

    async execute(data: CreateUserRequest): Promise<UserDTO> {
        const { name, email, role } = data;

        if (!name || !email) {
            throw new Error('Name and email are required');
        }

        const newUserEntity = new UserEntity(null, name, email, role || 'user');
        const createdUser = await this.userRepository.create(newUserEntity);

        return UserMapper.toDTO(createdUser);
    }
}
