import { Request, Response } from 'express';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { sendResponse } from '../../infrastructure/utils/response.util';

export class CreateUserController {
    constructor(private readonly createUserUseCase: CreateUserUseCase) { }

    async handle(req: Request, res: Response): Promise<void> {
        try {
            const userDTO = await this.createUserUseCase.execute(req.body);
            sendResponse(res, 201, true, 'User created successfully', userDTO);
        } catch (error: any) {
            sendResponse(res, 400, false, error.message);
        }
    }
}
