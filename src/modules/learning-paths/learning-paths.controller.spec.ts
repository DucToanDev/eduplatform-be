import { Test, TestingModule } from '@nestjs/testing';
import { LearningPathsController } from './learning-paths.controller';

describe('LearningPathsController', () => {
  let controller: LearningPathsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LearningPathsController],
    }).compile();

    controller = module.get<LearningPathsController>(LearningPathsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
