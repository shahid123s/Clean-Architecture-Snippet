const sendResponse = require('../../infrastructure/utils/response.util');

class GetUsersController {
    constructor(getAllUsersUseCase, getUserByIdUseCase) {
        this.getAllUsersUseCase = getAllUsersUseCase;
        this.getUserByIdUseCase = getUserByIdUseCase;
    }

    async getAll(req, res) {
        try {
            const usersDTO = await this.getAllUsersUseCase.execute();
            sendResponse(res, 200, true, 'Users retrieved successfully', usersDTO);
        } catch (error) {
            sendResponse(res, 500, false, error.message);
        }
    }

    async getById(req, res) {
        try {
            const userDTO = await this.getUserByIdUseCase.execute(req.params.id);
            sendResponse(res, 200, true, 'User retrieved successfully', userDTO);
        } catch (error) {
            if (error.message === 'User not found') {
                return sendResponse(res, 404, false, error.message);
            }
            sendResponse(res, 500, false, error.message);
        }
    }
}

module.exports = GetUsersController;
