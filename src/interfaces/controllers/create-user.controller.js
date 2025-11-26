const sendResponse = require('../../infrastructure/utils/response.util');

class CreateUserController {
    constructor(createUserUseCase) {
        this.createUserUseCase = createUserUseCase;
    }

    async handle(req, res) {
        try {
            const userDTO = await this.createUserUseCase.execute(req.body);
            sendResponse(res, 201, true, 'User created successfully', userDTO);
        } catch (error) {
            sendResponse(res, 400, false, error.message);
        }
    }
}

module.exports = CreateUserController;
