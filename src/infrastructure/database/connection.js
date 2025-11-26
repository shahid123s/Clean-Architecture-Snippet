const mongoose = require('mongoose');
const logger = require('../utils/logger.util');

const connectDB = async (uri) => {
    try {
        await mongoose.connect(uri);
        logger.info('MongoDB Connected Successfully');
    } catch (error) {
        logger.error(`MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
