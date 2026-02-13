import { Task, ITask } from '../models/Task';
import { getRedisClient } from '../config/redis';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

const CACHE_TTL = 3600; // 1 hour

const getCacheKey = (userId: string): string => `${userId}_tasks`;

export const taskService = {
  async getTasks(userId: string): Promise<ITask[]> {
    const cacheKey = getCacheKey(userId);

    try {
      const redis = getRedisClient();
      const cached = await redis.get(cacheKey);
      if (cached) {
        logger.debug('Cache hit for tasks:', userId);
        return JSON.parse(cached);
      }
    } catch (err) {
      logger.warn('Redis read error, falling back to DB:', err);
    }

    const tasks = await Task.find({ owner: userId }).sort({ createdAt: -1 });

    try {
      const redis = getRedisClient();
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(tasks));
    } catch (err) {
      logger.warn('Redis write error:', err);
    }

    return tasks;
  },

  async createTask(
    userId: string,
    data: { title: string; description?: string; status?: string; dueDate?: string },
  ): Promise<ITask> {
    const task = await Task.create({ ...data, owner: userId });
    await this.invalidateCache(userId);
    return task;
  },

  async updateTask(
    taskId: string,
    userId: string,
    data: Partial<{ title: string; description: string; status: string; dueDate: string | null }>,
  ): Promise<ITask> {
    const task = await Task.findById(taskId);
    if (!task) {
      throw new ApiError(404, 'Task not found');
    }
    if (task.owner.toString() !== userId) {
      throw new ApiError(403, 'Not authorized to update this task');
    }

    Object.assign(task, data);
    await task.save();
    await this.invalidateCache(userId);

    return task;
  },

  async deleteTask(taskId: string, userId: string): Promise<void> {
    const task = await Task.findById(taskId);
    if (!task) {
      throw new ApiError(404, 'Task not found');
    }
    if (task.owner.toString() !== userId) {
      throw new ApiError(403, 'Not authorized to delete this task');
    }

    await Task.findByIdAndDelete(taskId);
    await this.invalidateCache(userId);
  },

  async invalidateCache(userId: string): Promise<void> {
    try {
      const redis = getRedisClient();
      await redis.del(getCacheKey(userId));
      logger.debug('Cache invalidated for user:', userId);
    } catch (err) {
      logger.warn('Redis cache invalidation error:', err);
    }
  },
};
