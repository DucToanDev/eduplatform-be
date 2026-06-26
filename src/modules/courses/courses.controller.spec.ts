import { CoursesController } from './courses.controller';

describe('CoursesController', () => {
  it('should be defined', () => {
    const controller = new CoursesController({} as never);

    expect(controller).toBeDefined();
  });
});
