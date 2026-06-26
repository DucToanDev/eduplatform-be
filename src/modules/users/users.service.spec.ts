import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersService } from './users.service';
import { UserRole } from './schemas/users.schema';

describe('UsersService', () => {
  const userModel = {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  const service = () =>
    new UsersService(
      userModel as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should change password when current password is valid', async () => {
    const hashedPassword = await bcrypt.hash('old-password', 10);
    const user = {
      password: hashedPassword,
      raw_password: 'old-password',
      save: jest.fn().mockResolvedValue(undefined),
    };
    userModel.findById.mockResolvedValue(user);

    const result = await service().changePassword('6659f9f7c1e9e7f0c4f0d111', {
      current_password: 'old-password',
      new_password: 'new-password',
    });

    expect(user.password).not.toBe(hashedPassword);
    await expect(bcrypt.compare('new-password', user.password)).resolves.toBe(
      true,
    );
    expect(user.raw_password).toBeUndefined();
    expect(user.save).toHaveBeenCalled();
    expect(result).toEqual({ message: 'Đổi mật khẩu thành công' });
  });

  it('should reject invalid current password', async () => {
    const hashedPassword = await bcrypt.hash('old-password', 10);
    userModel.findById.mockResolvedValue({
      password: hashedPassword,
      save: jest.fn(),
    });

    await expect(
      service().changePassword('6659f9f7c1e9e7f0c4f0d111', {
        current_password: 'wrong-password',
        new_password: 'new-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should update user role and hide sensitive fields', async () => {
    const select = jest.fn().mockResolvedValue({
      _id: '6659f9f7c1e9e7f0c4f0d111',
      role: UserRole.MANAGER,
    });
    userModel.findByIdAndUpdate.mockReturnValue({ select });

    const result = await service().updateUserRole('6659f9f7c1e9e7f0c4f0d111', {
      role: UserRole.MANAGER,
    });

    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      '6659f9f7c1e9e7f0c4f0d111',
      { role: UserRole.MANAGER },
      { returnDocument: 'after', runValidators: true },
    );
    expect(select).toHaveBeenCalledWith('-password -raw_password');
    expect(result).toEqual({
      _id: '6659f9f7c1e9e7f0c4f0d111',
      role: UserRole.MANAGER,
    });
  });
});
