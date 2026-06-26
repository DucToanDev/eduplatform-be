import { CoursesService } from './courses.service';

describe('CoursesService', () => {
  it('should be defined', () => {
    const service = new CoursesService({} as never);

    expect(service).toBeDefined();
  });
});
