import { Test, TestingModule } from '@nestjs/testing';
import { LearningPathsService } from './learning-paths.service';

describe('LearningPathsService', () => {
  let service: LearningPathsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LearningPathsService],
    }).compile();

    service = module.get<LearningPathsService>(LearningPathsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
