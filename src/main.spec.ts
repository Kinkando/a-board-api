import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}));

describe('Main Bootstrap', () => {
  let createMock: jest.Mock;
  const listenMock = jest.fn();
  const useGlobalPipesMock = jest.fn();
  const enableCorsMock = jest.fn();

  beforeEach(async () => {
    createMock = NestFactory.create as jest.Mock;
  });

  it('should bootstrap the app without errors', async () => {
    createMock.mockResolvedValue({
      listen: listenMock,
      useGlobalPipes: useGlobalPipesMock,
      enableCors: enableCorsMock,
    });

    await (await import('./main')).bootstrap();

    expect(createMock).toHaveBeenCalledWith(AppModule);
    expect(useGlobalPipesMock).toHaveBeenCalled();
    expect(enableCorsMock).toHaveBeenCalled();
    expect(listenMock).toHaveBeenCalledWith(process.env.PORT ?? 3000);
  });
});
