// src/modules/auth/auth.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

import { LoginDto } from 'src/modules/auth/interfaces/dto/login.dto';
import { UserModel } from 'src/modules/users/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserModel.name) private UserModel: Model<UserModel>,
    private jwtService: JwtService,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    const user: any = await this.UserModel.findOne({ email }).populate('userTypeId', ['userTypeName', 'slug']).exec();
    if (user && bcrypt.compareSync(password, user.password)) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new BadRequestException({
        status: false,
        message: 'Invalid credentials',
        validation: {},
      });
    }
    const payload = { ...user };
    const token = await this.jwtService.signAsync(payload, { secret: process.env.JWT_SECRET });
    return { access_token: token, user };
  }
}
