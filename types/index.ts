import { Request } from 'express';

export type JwtPayload = {
  sub: number;
  iat: number;
  exp: number;
  type: TokenTypes;
  email: string;
};

export enum TokenTypes {
  ACCESS = 'access',
  REFRESH = 'refresh',
  RESET_PASSWORD = 'resetPassword',
  VERIFY_EMAIL = 'verifyEmail',
}

export enum ContactType {
  EMAIL = 'email',
  TELEGRAM = 'telegram',
}

export type RequestUser = {
  id: number;
  email: string;
  name: string;
};
export interface ICustomRequest extends Request {
  user: any;
}

export type CreateUserDate = {
  name: string;
  password: string;
  email: string;
};
