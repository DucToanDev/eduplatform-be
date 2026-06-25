import { QuizzesController } from './quizzes.controller';

describe('QuizzesController', () => {
  it('should be defined', () => {
    const controller = new QuizzesController({} as never);

    expect(controller).toBeDefined();
  });
});
