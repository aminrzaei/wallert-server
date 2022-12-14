import * as argon from 'argon2';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from 'src/auth/dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(registerDto: RegisterDto) {
    try {
      const hashedPassword = await argon.hash(registerDto.password);
      const user = await this.prisma.user.create({
        data: { ...registerDto, password: hashedPassword },
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

  async getUserByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) throw new NotFoundException('کاربری با این ایمیل یافت نشد');
    return user;
  }

  async verifyPassword(dbHash: string, requestPassword: string) {
    const pwMatches = await argon.verify(dbHash, requestPassword);
    if (!pwMatches) throw new ForbiddenException('اطلاعات وارد شده نادرست است');
    return pwMatches;
  }

  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (!user) throw new NotFoundException('کاربری با این مشخصات یافت نشد');
    return user;
  }

  async updateUserById(userId: number, updateBody: Partial<User>) {
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
