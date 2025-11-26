import mongoose from 'mongoose';
import { logger } from '../utils/logger.util';

export const connectDB = async (uri: string): Promise<void> => {
    try {
        await mongoose.connect(uri);
        logger.info('MongoDB Connected Successfully');
    } catch (error: any) {
        logger.error(`MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};
