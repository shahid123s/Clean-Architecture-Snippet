import { Request, Response } from 'express';
import { GetAllUsersUseCase } from '../../application/use-cases/get-all-users.use-case';
import { GetUserByIdUseCase } from '../../application/use-cases/get-user-by-id.use-case';
import { sendResponse } from '../../infrastructure/utils/response.util';

export class GetUsersController {
    constructor(
        private readonly getAllUsersUseCase: GetAllUsersUseCase,
        private readonly getUserByIdUseCase: GetUserByIdUseCase
    ) { }

    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const usersDTO = await this.getAllUsersUseCase.execute();
            sendResponse(res, 200, true, 'Users retrieved successfully', usersDTO);
        } catch (error: any) {
            sendResponse(res, 500, false, error.message);
        }
    }

    async getById(req: Request, res: Response): Promise<void> {
        try {
            const userDTO = await this.getUserByIdUseCase.execute(req.params.id);
            sendResponse(res, 200, true, 'User retrieved successfully', userDTO);
        } catch (error: any) {
            if (error.message === 'User not found') {
                sendResponse(res, 404, false, error.message);
                return;
            }
            sendResponse(res, 500, false, error.message);
        }
    }
}
