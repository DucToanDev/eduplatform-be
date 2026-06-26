import { Test, TestingModule } from '@nestjs/testing';
import { ErrorLogsService } from './error-logs.service';

describe('ErrorLogsService', () => {
  let service: ErrorLogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ErrorLogsService],
    }).compile();

    service = module.get<ErrorLogsService>(ErrorLogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
