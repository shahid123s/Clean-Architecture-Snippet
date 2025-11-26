import { Router, Request, Response } from 'express';
import { CreateUserController } from '../controllers/create-user.controller';
import { GetUsersController } from '../controllers/get-users.controller';

export const createUserRoutes = (
    createUserController: CreateUserController,
    getUsersController: GetUsersController
): Router => {
    const router = Router();

    router.post('/', (req: Request, res: Response) => createUserController.handle(req, res));
    router.get('/', (req: Request, res: Response) => getUsersController.getAll(req, res));
    router.get('/:id', (req: Request, res: Response) => getUsersController.getById(req, res));

    return router;
};
