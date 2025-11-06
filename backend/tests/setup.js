const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// 🧩 Mock Nodemailer globally for all tests
jest.mock('nodemailer', () => ({
  createTransport: () => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'mocked-id' }),
  }),
}));

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongo.stop();
});
