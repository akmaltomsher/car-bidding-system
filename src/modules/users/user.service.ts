import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { UpdateUserDto } from 'src/common/dto/user.dto';
import { UserModel, UserModelDocument } from 'src/modules/users/user.schema';
import { SequenceService } from 'src/modules/common/sequence/sequence-service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserModelDocument>,
    private readonly sequenceService: SequenceService,
  ) {}

  public get model() {
    return this.userModel;
  }

  async findAll(): Promise<UserModel[]> {
    return this.userModel.find().exec();
  }

  async create(createUserDto: any): Promise<UserModel> {
    const { password, email, ...restOfDto } = createUserDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('Email is already registered.');
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    const newUser = new this.userModel({
      ...restOfDto,
      email,
      password: hashedPassword,
    });

    newUser.userCode = await this.sequenceService.getNextSequenceCode('userSequence');

    return newUser.save();
  }

  async findOne(id: string): Promise<UserModel | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserModel | null> {
    const updatedUser = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async validatePassword(email: string, password: string): Promise<UserModel | null> {
    const user = await this.findByEmail(email);
    if (!user || !user['password']) return null;

    const isMatch = await bcrypt.compare(password, user['password']);
    return isMatch ? user : null;
  }
}
