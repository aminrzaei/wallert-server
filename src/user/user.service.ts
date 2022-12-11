import * as argon from 'argon2';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { RegisterDto } from 'src/auth/dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

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
    return user;
  }

  async verifyPassword(dbHash: string, requestPassword: string) {
    const pwMatches = await argon.verify(dbHash, requestPassword);
    return pwMatches;
  }
}
//   queryUsers = async (filter, options) => {
//     const users = await User.paginate(filter, options);
//     return users;
//   };

//   getUserById = async (id) => {
//     return User.findById(id);
//   };

//   updateUserById = async (userId, updateBody) => {
//     const user = await getUserById(userId);
//     if (!user) {
//       throw new ApiError(httpStatus.NOT_FOUND, 'کاربر یافت نشد');
//     }
//     if (
//       updateBody.email &&
//       (await User.isEmailTaken(updateBody.email, userId))
//     ) {
//       throw new ApiError(
//         httpStatus.BAD_REQUEST,
//         'این ایمیل قبلا استفاده شده است',
//       );
//     }
//     Object.assign(user, updateBody);
//     await user.save();
//     return user;
//   };

//   deleteUserById = async (userId) => {
//     const user = await getUserById(userId);
//     if (!user) {
//       throw new ApiError(httpStatus.NOT_FOUND, 'کاربر یافت نشد');
//     }
//     await user.remove();
//     return user;
//   };

//   updateUserEmail = async (userId, email) => {
//     const user = await getUserById(userId);
//     if (!user) {
//       throw new ApiError(httpStatus.NOT_FOUND, 'کاربر یافت نشد');
//     }
//     if (email && (await User.isEmailTaken(email, userId))) {
//       throw new ApiError(
//         httpStatus.BAD_REQUEST,
//         'این ایمیل قبلا استفاده شده است',
//       );
//     }
//     Object.assign(user, { email, isEmailVerified: false });
//     await user.save();
//     return user;
//   };

//   updateUserPassword = async (userId, password, newPassword) => {
//     const user = await getUserById(userId);
//     if (!user) {
//       throw new ApiError(httpStatus.NOT_FOUND, 'کاربر یافت نشد');
//     }
//     if (password && (await user.isPasswordMatch(password))) {
//       Object.assign(user, { password: newPassword });
//       await user.save();
//     } else {
//       throw new ApiError(httpStatus.BAD_REQUEST, 'رمز عبور صحیح نمی باشد');
//     }
//   };
