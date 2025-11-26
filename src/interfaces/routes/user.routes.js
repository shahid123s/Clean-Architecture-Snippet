const express = require('express');

/**
 * User Routes
 * Defines the API endpoints and maps them to controllers.
 * Dependencies are injected here (Composition Root pattern).
 */
const createUserRoutes = (createUserController, getUsersController) => {
    const router = express.Router();

    router.post('/', (req, res) => createUserController.handle(req, res));
    router.get('/', (req, res) => getUsersController.getAll(req, res));
    router.get('/:id', (req, res) => getUsersController.getById(req, res));

    return router;
};

module.exports = createUserRoutes;
