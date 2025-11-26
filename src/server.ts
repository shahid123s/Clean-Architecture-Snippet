import { createApp } from './app';
import { config } from './config';
import { logger } from './infrastructure/utils/logger.util';
import { connectDB } from './infrastructure/database/connection';
import { MongoUserRepository } from './infrastructure/repositories/mongo-user.repository';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { GetAllUsersUseCase } from './application/use-cases/get-all-users.use-case';
import { GetUserByIdUseCase } from './application/use-cases/get-user-by-id.use-case';
import { CreateUserController } from './interfaces/controllers/create-user.controller';
import { GetUsersController } from './interfaces/controllers/get-users.controller';
import { createUserRoutes } from './interfaces/routes/user.routes';

// Connect to Database
connectDB(config.mongoUri as string);

// Infrastructure Layer
const userRepository = new MongoUserRepository();

// Application Layer
const createUserUseCase = new CreateUserUseCase(userRepository);
const getAllUsersUseCase = new GetAllUsersUseCase(userRepository);
const getUserByIdUseCase = new GetUserByIdUseCase(userRepository);

// Interfaces Layer
const createUserController = new CreateUserController(createUserUseCase);
const getUsersController = new GetUsersController(getAllUsersUseCase, getUserByIdUseCase);

const userRoutes = createUserRoutes(createUserController, getUsersController);

// App Initialization
const app = createApp(userRoutes);
const PORT = config.port;

app.listen(PORT, () => {
    logger.info(`Server running in ${config.env} mode on port ${PORT}`);
});
