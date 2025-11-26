import { IUserRepository } from '../../application/ports/repositories/user.repository.interface';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserModel, IUserDocument } from '../database/models/user.model';

export class MongoUserRepository implements IUserRepository {
    async create(userEntity: UserEntity): Promise<UserEntity> {
        const userModel = new UserModel({
            name: userEntity.name,
            email: userEntity.email,
            role: userEntity.role,
        });

        const savedUser = await userModel.save();
        return this._mapToEntity(savedUser);
    }

    async findAll(): Promise<UserEntity[]> {
        const users = await UserModel.find();
        return users.map(user => this._mapToEntity(user));
    }

    async findById(id: string): Promise<UserEntity | null> {
        try {
            const user = await UserModel.findById(id);
            if (!user) return null;
            return this._mapToEntity(user);
        } catch (error) {
            return null;
        }
    }

    private _mapToEntity(mongoUser: IUserDocument): UserEntity {
        return new UserEntity(
            mongoUser._id.toString(),
            mongoUser.name,
            mongoUser.email,
            mongoUser.role
        );
    }
}
