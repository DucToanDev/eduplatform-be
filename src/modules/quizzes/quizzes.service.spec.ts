import { QuizzesService } from './quizzes.service';

describe('QuizzesService', () => {
  it('should be defined', () => {
    const service = new QuizzesService(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    expect(service).toBeDefined();
  });
});
