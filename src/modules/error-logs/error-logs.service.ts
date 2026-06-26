import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ErrorLog, ErrorLogDocument } from './schemas/error-log.schema';

@Injectable()
export class ErrorLogsService {
  constructor(
    @InjectModel(ErrorLog.name) private errorLogModel: Model<ErrorLogDocument>,
  ) {}

  async logError(data: Partial<ErrorLog>): Promise<void> {
    try {
      const log = new this.errorLogModel(data);
      await log.save();
    } catch (error) {
      console.error('Failed to save error log:', error);
    }
  }

  async getRecentLogs(limit: number = 50, page: number = 1): Promise<{ data: ErrorLog[], total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.errorLogModel.find().sort({ created_at: -1 }).skip(skip).limit(limit).exec(),
      this.errorLogModel.countDocuments().exec()
    ]);
    return { data, total };
  }
}
