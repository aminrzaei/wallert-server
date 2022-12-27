import * as argon from 'argon2';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { User } from '@prisma/client';
import { CreateUserDate } from '../../types';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(createUserData: CreateUserDate): Promise<User> {
    try {
      const hashedPassword = await argon.hash(createUserData.password);
      const user = this.prisma.user.create({
        data: { ...createUserData, password: hashedPassword },
      });
      return user;
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new ForbiddenException(
            'کاربر با اطلاعات وارد شده موجود می باشد',
          );
        }
      }
      throw err;
    }
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) throw new NotFoundException('کاربری با این ایمیل یافت نشد');
    return user;
  }

  async verifyPassword(
    dbHash: string,
    requestPassword: string,
  ): Promise<boolean> {
    const pwMatches = await argon.verify(dbHash, requestPassword);
    if (!pwMatches) throw new ForbiddenException('اطلاعات وارد شده نادرست است');
    return pwMatches;
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (!user) throw new NotFoundException('کاربری با این شناسه یافت نشد');
    return user;
  }

  async updateUserById(
    userId: number,
    updateBody: Partial<User>,
  ): Promise<User> {
    try {
      if (updateBody.password) {
        const hashedPassword = await argon.hash(updateBody.password);
        updateBody.password = hashedPassword;
      }
      const updatedUser = await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: updateBody,
      });
      return updatedUser;
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new ForbiddenException(
            'کاربر با اطلاعات وارد شده موجود می باشد',
          );
        }
      }
      throw err;
    }
  }
}
