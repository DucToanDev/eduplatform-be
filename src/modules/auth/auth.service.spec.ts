import {
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UserRole } from './shemas/users.schemas';

describe('AuthService', () => {
  let service: AuthService;

  const userModel = {
    create: jest.fn(),
    findOne: jest.fn(),
    updateOne: jest.fn(),
  };

  const jwtService = {
    sign: jest.fn(),
  };

  const baseUser = {
    _id: '6659f9f7c1e9e7f0c4f0d1111',
    fullname: 'Nguyen Van A',
    email: 'teacher@example.com',
    role: UserRole.TEACHER,
    status: true,
    password: '',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(userModel as never, jwtService as never);
    jwtService.sign.mockReturnValue('signed-jwt-token');
  });

  describe('signUp', () => {
    it('should create a user with hashed password and return auth response', async () => {
      userModel.create.mockImplementation(async (payload) => ({
        ...baseUser,
        ...payload,
        _id: baseUser._id,
        role: UserRole.TEACHER,
        status: true,
      }));

      const result = await service.signUp({
        fullname: 'Nguyen Van A',
        email: 'teacher@example.com',
        password: 'password123',
      });

      expect(userModel.create).toHaveBeenCalledWith({
        fullname: 'Nguyen Van A',
        email: 'teacher@example.com',
        password: expect.any(String),
      });
      expect(userModel.create.mock.calls[0][0].password).not.toBe(
        'password123',
      );
      await expect(
        bcrypt.compare(
          'password123',
          userModel.create.mock.calls[0][0].password,
        ),
      ).resolves.toBe(true);
      expect(jwtService.sign).toHaveBeenCalledWith({ id: baseUser._id });
      expect(result.data).toEqual({
        accessToken: 'signed-jwt-token',
        user: {
          id: baseUser._id,
          fullname: 'Nguyen Van A',
          email: 'teacher@example.com',
          role: UserRole.TEACHER,
          status: true,
        },
      });
    });

    it('should throw ConflictException when email already exists', async () => {
      userModel.create.mockRejectedValue({ code: 11000 });

      await expect(
        service.signUp({
          fullname: 'Nguyen Van A',
          email: 'teacher@example.com',
          password: 'password123',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    it('should return auth response and update last login when credentials are valid', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      userModel.findOne.mockResolvedValue({
        ...baseUser,
        password: hashedPassword,
      });
      userModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.login({
        email: 'teacher@example.com',
        password: 'password123',
      });

      expect(userModel.findOne).toHaveBeenCalledWith({
        email: 'teacher@example.com',
      });
      expect(userModel.updateOne).toHaveBeenCalledWith(
        { _id: baseUser._id },
        { $set: { last_login_at: expect.any(Date) } },
      );
      expect(jwtService.sign).toHaveBeenCalledWith({ id: baseUser._id });
      expect(result.data.accessToken).toBe('signed-jwt-token');
      expect(result.data.user).toEqual({
        id: baseUser._id,
        fullname: baseUser.fullname,
        email: baseUser.email,
        role: baseUser.role,
        status: baseUser.status,
      });
    });

    it('should throw UnauthorizedException when email does not exist', async () => {
      userModel.findOne.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'missing@example.com',
          password: 'password123',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(userModel.updateOne).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      userModel.findOne.mockResolvedValue({
        ...baseUser,
        password: hashedPassword,
      });

      await expect(
        service.login({
          email: 'teacher@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(userModel.updateOne).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when account is inactive', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      userModel.findOne.mockResolvedValue({
        ...baseUser,
        status: false,
        password: hashedPassword,
      });

      await expect(
        service.login({
          email: 'teacher@example.com',
          password: 'password123',
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(userModel.updateOne).not.toHaveBeenCalled();
    });
  });
});
