import { Request } from 'express';

export type JwtPayload = {
  sub: number;
  iat: number;
  exp: number;
  type: TokenTypes;
};

export enum TokenTypes {
  ACCESS = 'access',
  REFRESH = 'refresh',
  RESET_PASSWORD = 'resetPassword',
  VERIFY_EMAIL = 'verifyEmail',
}

export interface IUserRequest extends Request {
  user: any;
}
