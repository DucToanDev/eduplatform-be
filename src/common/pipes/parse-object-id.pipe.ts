import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<any, Types.ObjectId> {
  transform(value: any): Types.ObjectId {
    const validObjectId = Types.ObjectId.isValid(value);
    if (!validObjectId) {
      throw new BadRequestException('ID không đúng định dạng của hệ thống');
    }
    return new Types.ObjectId(value);
  }
}
