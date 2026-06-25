/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CustomFeatureRequestsService } from './custom-feature-requests.service';
import { CustomFeatureRequestStatus } from './schemas/custom-feature-request.schema';
import { UserRole } from '../users/schemas/users.schema';

describe('CustomFeatureRequestsService', () => {
  const requestModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    countDocuments: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a pending request for the current teacher', async () => {
    const created = { request_content: 'Need report builder' };
    requestModel.create.mockResolvedValue(created);
    const service = new CustomFeatureRequestsService(requestModel as never);

    const result = await service.create('6659f9f7c1e9e7f0c4f0d111', {
      request_content: 'Need report builder',
      contact_info: 'teacher@example.com',
    });

    expect(requestModel.create).toHaveBeenCalledWith({
      request_content: 'Need report builder',
      contact_info: 'teacher@example.com',
      teacher_id: expect.any(Object),
    });
    expect(result).toBe(created);
  });

  it('should prevent teachers from viewing another teacher request', async () => {
    requestModel.findById.mockResolvedValue({
      teacher_id: { toString: () => '6659f9f7c1e9e7f0c4f0d222' },
      populate: jest.fn(),
    });
    const service = new CustomFeatureRequestsService(requestModel as never);

    await expect(
      service.findOne('6659f9f7c1e9e7f0c4f0d333', {
        id: '6659f9f7c1e9e7f0c4f0d111',
        role: UserRole.TEACHER,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should update request status for admin/manager flow', async () => {
    const updated = {
      status: CustomFeatureRequestStatus.RESOLVED,
      populate: jest
        .fn()
        .mockResolvedValue({ status: CustomFeatureRequestStatus.RESOLVED }),
    };
    requestModel.findByIdAndUpdate.mockReturnValue(updated);
    const service = new CustomFeatureRequestsService(requestModel as never);

    const result = await service.updateStatus('6659f9f7c1e9e7f0c4f0d333', {
      status: CustomFeatureRequestStatus.RESOLVED,
    });

    expect(requestModel.findByIdAndUpdate).toHaveBeenCalledWith(
      '6659f9f7c1e9e7f0c4f0d333',
      { status: CustomFeatureRequestStatus.RESOLVED },
      { new: true, runValidators: true },
    );
    expect(result).toEqual({ status: CustomFeatureRequestStatus.RESOLVED });
  });

  it('should throw when updating missing request', async () => {
    requestModel.findByIdAndUpdate.mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });
    const service = new CustomFeatureRequestsService(requestModel as never);

    await expect(
      service.updateStatus('6659f9f7c1e9e7f0c4f0d333', {
        status: CustomFeatureRequestStatus.REJECTED,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
