import express, { Express, Router, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { sendResponse } from './infrastructure/utils/response.util';

export const createApp = (userRoutes: Router): Express => {
    const app = express();

    // Middleware
    app.use(express.json());
    app.use(cors());
    app.use(helmet());
    app.use(morgan('dev'));

    // Routes
    app.use('/api/v1/users', userRoutes);

    // Root Endpoint
    app.get('/', (req: Request, res: Response) => {
        sendResponse(res, 200, true, 'Welcome to the Clean Architecture API');
    });

    // 404 Handler
    app.use((req: Request, res: Response) => {
        sendResponse(res, 404, false, 'Route not found');
    });

    return app;
};
