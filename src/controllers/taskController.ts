import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { taskService } from '../services/taskService';
import { ApiError } from '../utils/ApiError';

export const taskController = {
  async getTasks(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const tasks = await taskService.getTasks(req.userId!);
      res.status(200).json({ success: true, data: tasks });
    } catch (error) {
      next(error);
    }
  },

  async createTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await taskService.createTask(req.userId!, req.body);
      res.status(201).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  },

  async updateTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) throw new ApiError(400, 'Task ID is required');
      const task = await taskService.updateTask(id, req.userId!, req.body);
      res.status(200).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  },

  async deleteTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) throw new ApiError(400, 'Task ID is required');
      await taskService.deleteTask(id, req.userId!);
      res.status(200).json({ success: true, message: 'Task deleted successfully' });
    } catch (error) {
      next(error);
    }
  },
};
