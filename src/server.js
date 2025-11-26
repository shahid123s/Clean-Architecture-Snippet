const createApp = require('./app');
const config = require('./config');
const logger = require('./infrastructure/utils/logger.util');
const connectDB = require('./infrastructure/database/connection');

// Infrastructure Layer
// const InMemoryUserRepository = require('./infrastructure/repositories/in-memory-user.repository');
const MongoUserRepository = require('./infrastructure/repositories/mongo-user.repository');

// Connect to Database
connectDB(config.mongoUri);

// const userRepository = new InMemoryUserRepository();
const userRepository = new MongoUserRepository();

// Application Layer
const CreateUserUseCase = require('./application/use-cases/create-user.use-case');
const GetAllUsersUseCase = require('./application/use-cases/get-all-users.use-case');
const GetUserByIdUseCase = require('./application/use-cases/get-user-by-id.use-case');

const createUserUseCase = new CreateUserUseCase(userRepository);
const getAllUsersUseCase = new GetAllUsersUseCase(userRepository);
const getUserByIdUseCase = new GetUserByIdUseCase(userRepository);

// Interfaces Layer
const CreateUserController = require('./interfaces/controllers/create-user.controller');
const GetUsersController = require('./interfaces/controllers/get-users.controller');
const createUserRoutes = require('./interfaces/routes/user.routes');

const createUserController = new CreateUserController(createUserUseCase);
const getUsersController = new GetUsersController(getAllUsersUseCase, getUserByIdUseCase);

const userRoutes = createUserRoutes(createUserController, getUsersController);

// App Initialization
const app = createApp(userRoutes);
const PORT = config.port;

app.listen(PORT, () => {
    logger.info(`Server running in ${config.env} mode on port ${PORT}`);
});
