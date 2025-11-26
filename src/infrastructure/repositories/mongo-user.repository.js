const UserRepositoryInterface = require('../../application/ports/repositories/user.repository.interface');
const UserEntity = require('../../domain/entities/user.entity');
const UserModel = require('../database/schemas/user.schema');

/**
 * MongoUserRepository
 * Concrete implementation of UserRepositoryInterface using MongoDB/Mongoose.
 */
class MongoUserRepository extends UserRepositoryInterface {
    async create(userEntity) {
        // Map Domain Entity -> Mongoose Model
        const userModel = new UserModel({
            name: userEntity.name,
            email: userEntity.email,
            role: userEntity.role,
            createdAt: userEntity.createdAt,
        });

        const savedUser = await userModel.save();

        // Map Mongoose Document -> Domain Entity
        return this._mapToEntity(savedUser);
    }

    async findAll() {
        const users = await UserModel.find();
        return users.map(user => this._mapToEntity(user));
    }

    async findById(id) {
        // Note: MongoDB uses _id (ObjectId), but our simple domain used integer IDs previously.
        // For this example, we'll assume the ID passed is a valid MongoDB ObjectId string.
        // In a real app, you'd handle ID validation/conversion here.
        try {
            const user = await UserModel.findById(id);
            if (!user) return null;
            return this._mapToEntity(user);
        } catch (error) {
            // If ID format is invalid, return null or throw specific domain error
            return null;
        }
    }

    _mapToEntity(mongoUser) {
        return new UserEntity(
            mongoUser._id.toString(), // Convert ObjectId to string
            mongoUser.name,
            mongoUser.email,
            mongoUser.role,
            mongoUser.createdAt
        );
    }
}

module.exports = MongoUserRepository;
