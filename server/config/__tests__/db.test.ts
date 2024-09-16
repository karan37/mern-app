import mongoose from 'mongoose';
import connectDB from '../db';

describe('connectDB', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should connect to MongoDB and log a success message', async () => {
    const mockConsoleLog = jest
      .spyOn(console, 'log')
      .mockImplementation(() => {});
    const mockExit = jest
      .spyOn(process, 'exit')
      .mockImplementation(jest.fn() as any);

    jest.spyOn(mongoose, 'connect').mockResolvedValue(undefined as any);

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URI);
    expect(mockConsoleLog).toHaveBeenCalledWith('MongoDB connected...');
    expect(mockExit).not.toHaveBeenCalled();

    mockConsoleLog.mockRestore();
    mockExit.mockRestore();
  });

  it('should handle errors and exit process on failure', async () => {
    const mockConsoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const mockExit = jest
      .spyOn(process, 'exit')
      .mockImplementation(jest.fn() as any);

    jest
      .spyOn(mongoose, 'connect')
      .mockRejectedValue(new Error('Connection failed'));

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URI);
    expect(mockConsoleError).toHaveBeenCalledWith('Connection failed');
    expect(mockExit).toHaveBeenCalledWith(1);

    mockConsoleError.mockRestore();
    mockExit.mockRestore();
  });
});
