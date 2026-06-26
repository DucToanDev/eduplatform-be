import { Test, TestingModule } from '@nestjs/testing';
import { ErrorLogsController } from './error-logs.controller';

describe('ErrorLogsController', () => {
  let controller: ErrorLogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ErrorLogsController],
    }).compile();

    controller = module.get<ErrorLogsController>(ErrorLogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
