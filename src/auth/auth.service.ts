import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  register() {
    return { msg: 'I haved regesterd' };
  }
  login() {
    return { msg: 'I haved logined' };
  }
}
