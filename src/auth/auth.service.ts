import { Injectable } from '@nestjs/common';

@Injectable({})
export class AuthService {
  register() {
    return { msg: 'I haved regesterd' };
  }
  login() {
    return { msg: 'I haved logined' };
  }
}
