const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const sendResponse = require('./infrastructure/utils/response.util');

const createApp = (userRoutes) => {
    const app = express();

    // Middleware
    app.use(express.json());
    app.use(cors());
    app.use(helmet());
    app.use(morgan('dev'));

    // Routes
    app.use('/api/v1/users', userRoutes);

    // Root Endpoint
    app.get('/', (req, res) => {
        sendResponse(res, 200, true, 'Welcome to the Clean Architecture API');
    });

    // 404 Handler
    app.use((req, res) => {
        sendResponse(res, 404, false, 'Route not found');
    });

    return app;
};

module.exports = createApp;
