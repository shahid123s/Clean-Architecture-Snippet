import { UserEntity } from '../../../domain/entities/user.entity';

export interface IUserRepository {
    create(userEntity: UserEntity): Promise<UserEntity>;
    findAll(): Promise<UserEntity[]>;
    findById(id: string): Promise<UserEntity | null>;
}
