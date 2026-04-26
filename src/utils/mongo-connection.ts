import mongoose from 'mongoose';
import cluster from 'cluster';
import logger from './logger';

const connectToMongoDB = async (uri: string) => {
    try {
        await mongoose.connect(uri);
        if (cluster.isPrimary) console.log('Connected to MongoDB successfully');
    } catch (error: unknown) {
        if (error instanceof Error) {
            logger.error(`Error: Error connecting to MongoDB: ${error.message}`, { stack: error.stack });
        } else {
            logger.error(`Error: An unknown error occurred while connecting to MongoDB`);
        }
        process.exit(1);
    }
};

// Graceful shutdown for MongoDB connection
process.on('SIGINT', async () => {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
});

export default connectToMongoDB;
