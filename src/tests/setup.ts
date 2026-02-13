import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import RedisMock from 'ioredis-mock';
import { setRedisClient } from '../config/redis';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  const redisMock = new RedisMock();
  setRedisClient(redisMock as any);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }

  const redis = new RedisMock();
  await redis.flushall();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
