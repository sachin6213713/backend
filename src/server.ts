import app from './app';
import { config } from './config';
import { connectDB } from './config/database';
import { getRedisClient } from './config/redis';
import { logger } from './utils/logger';

const start = async (): Promise<void> => {
  try {
    await connectDB();
    getRedisClient();

    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
