import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { Users } from './shemas/users.schemas';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

type AuthTokenResponse = {
  token: string;
};

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Users.name)
    private readonly userModel: Model<Users>,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(signUpDTO: SignUpDto): Promise<AuthTokenResponse> {
    const { fullname, email, password } = signUpDTO;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userModel.create({
      fullname,
      email,
      password: hashedPassword,
    });

    const token = this.jwtService.sign({ id: user._id });

    return { token };
  }

  async login(loginDto: LoginDto): Promise<AuthTokenResponse> {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không hợp lệ');
    }

    const isPasswordMathches = await bcrypt.compare(password, user.password);
    if (!isPasswordMathches) {
      throw new UnauthorizedException('Mật khẩu không hợp lệ');
    }
    const token = this.jwtService.sign({ id: user._id });

    return { token };
  }
}
