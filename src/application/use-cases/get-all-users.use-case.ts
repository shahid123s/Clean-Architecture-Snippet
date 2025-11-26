import { IUserRepository } from '../ports/repositories/user.repository.interface';
import { UserMapper } from '../mappers/user.mapper';
import { UserDTO } from '../../domain/dtos/user.dto';

export class GetAllUsersUseCase {
    constructor(private readonly userRepository: IUserRepository) { }

    async execute(): Promise<UserDTO[]> {
        const users = await this.userRepository.findAll();
        return users.map(user => UserMapper.toDTO(user));
    }
}
