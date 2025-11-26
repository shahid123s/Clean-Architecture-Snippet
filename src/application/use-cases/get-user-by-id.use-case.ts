import { IUserRepository } from '../ports/repositories/user.repository.interface';
import { UserMapper } from '../mappers/user.mapper';
import { UserDTO } from '../../domain/dtos/user.dto';

export class GetUserByIdUseCase {
    constructor(private readonly userRepository: IUserRepository) { }

    async execute(id: string): Promise<UserDTO> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        return UserMapper.toDTO(user);
    }
}
