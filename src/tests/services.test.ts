// import { authService } from '../services/authService';
// import { taskService } from '../services/taskService';
// import { User } from '../models/User';

// describe('Auth Service', () => {
//   it('should create user with hashed password', async () => {
//     const result = await authService.signup('Test', 'svc@test.com', 'password123');
//     expect(result.token).toBeDefined();
//     expect(result.user.email).toBe('svc@test.com');

//     const dbUser = await User.findById(result.user._id);
//     expect(dbUser!.password).not.toBe('password123');
//   });

//   it('should throw on duplicate signup', async () => {
//     await authService.signup('Test', 'dup@test.com', 'password123');
//     await expect(authService.signup('Test2', 'dup@test.com', 'password123')).rejects.toThrow(
//       'Email already registered',
//     );
//   });

//   it('should login with correct credentials', async () => {
//     await authService.signup('Test', 'login@test.com', 'password123');
//     const result = await authService.login('login@test.com', 'password123');
//     expect(result.token).toBeDefined();
//   });

//   it('should throw on wrong password', async () => {
//     await authService.signup('Test', 'wrong@test.com', 'password123');
//     await expect(authService.login('wrong@test.com', 'wrongpass')).rejects.toThrow(
//       'Invalid email or password',
//     );
//   });
// });

// describe('Task Service', () => {
//   let userId: string;

//   beforeEach(async () => {
//     const result = await authService.signup('TaskOwner', 'owner@test.com', 'password123');
//     userId = (result.user._id as string).toString();
//   });

//   it('should create and retrieve tasks', async () => {
//     await taskService.createTask(userId, { title: 'Service Task' });
//     const tasks = await taskService.getTasks(userId);
//     expect(tasks).toHaveLength(1);
//     expect(tasks[0].title).toBe('Service Task');
//   });

//   it('should update task', async () => {
//     const task = await taskService.createTask(userId, { title: 'To Update' });
//     const updated = await taskService.updateTask(task._id as string, userId, {
//       title: 'Updated',
//       status: 'completed',
//     });
//     expect(updated.title).toBe('Updated');
//     expect(updated.status).toBe('completed');
//   });

//   it('should delete task', async () => {
//     const task = await taskService.createTask(userId, { title: 'To Delete' });
//     await taskService.deleteTask(task._id as string, userId);
//     const tasks = await taskService.getTasks(userId);
//     expect(tasks).toHaveLength(0);
//   });

//   it('should throw when updating non-owned task', async () => {
//     const task = await taskService.createTask(userId, { title: 'Not Yours' });
//     await expect(
//       taskService.updateTask(task._id as string, '507f1f77bcf86cd799439011', { title: 'Hack' }),
//     ).rejects.toThrow('Not authorized');
//   });
// });



import { authService } from '../services/authService';
import { taskService } from '../services/taskService';
import { User } from '../models/User';

describe('Auth Service', () => {
  it('should create user with hashed password', async () => {
    const result = await authService.signup('Test', 'svc@test.com', 'password123');

    expect(result.token).toBeDefined();
    expect(result.user.email).toBe('svc@test.com');

    const dbUser = await User.findById(result.user._id.toString());
    expect(dbUser!.password).not.toBe('password123');
  });

  it('should throw on duplicate signup', async () => {
    await authService.signup('Test', 'dup@test.com', 'password123');

    await expect(
      authService.signup('Test2', 'dup@test.com', 'password123')
    ).rejects.toThrow('Email already registered');
  });

  it('should login with correct credentials', async () => {
    await authService.signup('Test', 'login@test.com', 'password123');

    const result = await authService.login('login@test.com', 'password123');
    expect(result.token).toBeDefined();
  });

  it('should throw on wrong password', async () => {
    await authService.signup('Test', 'wrong@test.com', 'password123');

    await expect(
      authService.login('wrong@test.com', 'wrongpass')
    ).rejects.toThrow('Invalid email or password');
  });
});

describe('Task Service', () => {
  let userId: string;

  beforeEach(async () => {
    const result = await authService.signup('TaskOwner', 'owner@test.com', 'password123');

    // 🔥 FIXED ObjectId -> string
    userId = result.user._id.toString();
  });

  it('should create and retrieve tasks', async () => {
    await taskService.createTask(userId, { title: 'Service Task' });

    const tasks = await taskService.getTasks(userId);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Service Task');
  });

  it('should update task', async () => {
    const task = await taskService.createTask(userId, { title: 'To Update' });

    const updated = await taskService.updateTask(
      task._id.toString(),
      userId,
      {
        title: 'Updated',
        status: 'completed',
      }
    );

    expect(updated.title).toBe('Updated');
    expect(updated.status).toBe('completed');
  });

  it('should delete task', async () => {
    const task = await taskService.createTask(userId, { title: 'To Delete' });

    await taskService.deleteTask(task._id.toString(), userId);

    const tasks = await taskService.getTasks(userId);
    expect(tasks).toHaveLength(0);
  });

  it('should throw when updating non-owned task', async () => {
    const task = await taskService.createTask(userId, { title: 'Not Yours' });

    await expect(
      taskService.updateTask(
        task._id.toString(),
        '507f1f77bcf86cd799439011',
        { title: 'Hack' }
      )
    ).rejects.toThrow('Not authorized');
  });
});
