import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as pactum from 'pactum';
import { AppModule } from './../src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenService } from 'src/token/token.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tokenService: TokenService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    tokenService = app.get(TokenService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    describe('Send verification email', () => {
      it('Should send verification email', () => {
        return pactum
          .spec()
          .post('/auth/send-verification-email')
          .withBody({ email: 'my.aminrezaei@gmail.com' })
          .expectStatus(200);
      }, 10000);
      it('Should throw if no email provided', () => {
        return pactum
          .spec()
          .post('/auth/send-verification-email')
          .expectStatus(400);
      });
      it('Should throw if invalid email provided', () => {
        return pactum
          .spec()
          .post('/auth/send-verification-email')
          .withBody({ email: 'my.gmail.com' })
          .expectStatus(400);
      });
    });
    describe('Register', () => {
      it('Should register', async () => {
        const vertifyEmailToken = await tokenService.generateVerifyEmailToken(
          'my.aminrezaei@gmail.com',
        );
        return pactum
          .spec()
          .withBody({
            token: vertifyEmailToken,
            name: 'John',
            password: '#4554opts',
          })
          .post('/auth/register')
          .expectStatus(201)
          .expectJsonSchema({
            type: 'object',
            properties: {
              user: {
                type: 'object',
              },
              access_token: {
                type: 'object',
              },
            },
          });
      });
      it('Should throw if no refresh token', () => {
        return pactum
          .spec()
          .withBody({
            name: 'John',
            password: '#4554opts',
          })
          .post('/auth/register')
          .expectStatus(400);
      });
      it('Should throw if invalid token', () => {
        return pactum
          .spec()
          .withBody({
            token: 'INVALIDTOKEN',
            name: 'John',
            password: '#4554opts',
          })
          .post('/auth/register')
          .expectStatus(400);
      });
      it('Should throw if expired token', () => {
        return pactum
          .spec()
          .withBody({
            token:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOi0xLCJpYXQiOjE2NzIyMjUzNzMsImV4cCI6MTY3MjIyNTk3MywiZW1haWwiOiJteS5hbWlucmV6YWVpQGdtYWlsLmNvbSIsInR5cGUiOiJ2ZXJpZnlFbWFpbCJ9.MK5-tWKkh9g92jwaFeUba7yhlEx9gGQ0m8LJUVf1Zvw',
            name: 'John',
            password: '#4554opts',
          })
          .post('/auth/register')
          .expectStatus(401);
      });
      it('Should throw if no name', async () => {
        const vertifyEmailToken = await tokenService.generateVerifyEmailToken(
          'my.aminrezaei@gmail.com',
        );
        return pactum
          .spec()
          .withBody({
            token: vertifyEmailToken,
            password: '#4554opts',
          })
          .post('/auth/register')
          .expectStatus(400);
      });
      it('Should throw if too short name', async () => {
        const vertifyEmailToken = await tokenService.generateVerifyEmailToken(
          'my.aminrezaei@gmail.com',
        );
        return pactum
          .spec()
          .withBody({
            token: vertifyEmailToken,
            name: 'A',
            password: '#4554opts',
          })
          .post('/auth/register')
          .expectStatus(400);
      });
      it('Should throw if no password', async () => {
        const vertifyEmailToken = await tokenService.generateVerifyEmailToken(
          'my.aminrezaei@gmail.com',
        );
        return pactum
          .spec()
          .withBody({
            token: vertifyEmailToken,
            name: 'John',
          })
          .post('/auth/register')
          .expectStatus(400);
      });
      it('Should throw if invalid password', async () => {
        const vertifyEmailToken = await tokenService.generateVerifyEmailToken(
          'my.aminrezaei@gmail.com',
        );
        return pactum
          .spec()
          .withBody({
            token: vertifyEmailToken,
            name: 'John',
            password: '12345',
          })
          .post('/auth/register')
          .expectStatus(400);
      });
    });
    describe('Login', () => {
      it('Should Login', () => {
        pactum.handler.addCaptureHandler('refreshToken', (ctx) => {
          return ctx.res.headers['set-cookie'][0];
        });
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            email: 'my.aminrezaei@gmail.com',
            password: '#4554opts',
          })
          .expectStatus(200)
          .stores('UserAccessToken', 'access_token.token')
          .stores('UserRefreshToken', '#refreshToken')
          .expectJsonSchema({
            type: 'object',
            properties: {
              user: {
                type: 'object',
              },
              access_token: {
                type: 'object',
              },
            },
          });
      });
      it('Should throw if no email', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            password: '#4554opts',
          })
          .expectStatus(400);
      });
      it('Should throw if invalid email', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            email: 'my.gmail.com',
            password: '#4554opts',
          })
          .expectStatus(400);
      });
      it('Should throw if no password', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            email: 'my.aminrezaei@gmail.com',
          })
          .expectStatus(400);
      });
      it('Should throw if invalid password', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            email: 'my.aminrezaei@gmail.com',
            password: '4554opts',
          })
          .expectStatus(400);
      });
    });
    describe('Refresh Tokens', () => {
      it('Should refresh token', async () => {
        return pactum
          .spec()
          .post('/auth/refresh-tokens')
          .withCookies('$S{UserRefreshToken}')
          .expectStatus(200)
          .expectJsonSchema({
            type: 'object',
            properties: {
              user: {
                type: 'object',
              },
              access_token: {
                type: 'object',
              },
            },
          });
      });
      it('Should throw if no token', () => {
        return pactum.spec().post('/auth/refresh-tokens').expectStatus(401);
      });
      it('Should throw if invalid token', () => {
        return pactum
          .spec()
          .withCookies('INVALIDTOKEN')
          .post('/auth/refresh-tokens')
          .expectStatus(401);
      });
    });
    describe('Forgot Password', () => {
      it('Should send forget password email', () => {
        return pactum
          .spec()
          .post('/auth/forgot-password')
          .withBody({ email: 'my.aminrezaei@gmail.com' })
          .expectStatus(200);
      }, 10000);
      it('Should throw if invalid email', () => {
        return pactum
          .spec()
          .post('/auth/forgot-password')
          .withBody({
            email: 'my.gmail.com',
          })
          .expectStatus(400);
      });
      it('Should throw if no user with email', () => {
        return pactum
          .spec()
          .post('/auth/forgot-password')
          .withBody({
            email: 'notregistereduser@gmail.com',
          })
          .expectStatus(404);
      });
      it('Should throw if no email', () => {
        return pactum.spec().post('/auth/forgot-password').expectStatus(400);
      });
    });
    describe('Reset Password', () => {
      it('Should reset password', async () => {
        const resetPasswordToken =
          await tokenService.generateResetPasswordToken(
            'my.aminrezaei@gmail.com',
          );
        return pactum
          .spec()
          .post('/auth/reset-password')
          .withBody({
            token: resetPasswordToken,
            password: '#6060opts',
          })
          .expectStatus(200);
      });
      it('Should throw if no refresh token', () => {
        return pactum
          .spec()
          .withBody({
            password: '#4554opts',
          })
          .post('/auth/reset-password')
          .expectStatus(400);
      });
      it('Should throw if invalid token', () => {
        return pactum
          .spec()
          .withBody({
            token: 'INVALIDTOKEN',
            password: '#4554opts',
          })
          .post('/auth/reset-password')
          .expectStatus(400);
      });
      it('Should throw if expired token', () => {
        return pactum
          .spec()
          .withBody({
            token:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOi0xLCJpYXQiOjE2NzIyMjUzNzMsImV4cCI6MTY3MjIyNTk3MywiZW1haWwiOiJteS5hbWlucmV6YWVpQGdtYWlsLmNvbSIsInR5cGUiOiJ2ZXJpZnlFbWFpbCJ9.MK5-tWKkh9g92jwaFeUba7yhlEx9gGQ0m8LJUVf1Zvw',
            password: '#4554opts',
          })
          .post('/auth/reset-password')
          .expectStatus(401);
      });
      it('Should throw if no password', async () => {
        const resetPasswordToken =
          await tokenService.generateResetPasswordToken(
            'my.aminrezaei@gmail.com',
          );
        return pactum
          .spec()
          .withBody({
            token: resetPasswordToken,
            name: 'John',
          })
          .post('/auth/reset-password')
          .expectStatus(400);
      });
      it('Should throw if invalid password', async () => {
        const resetPasswordToken =
          await tokenService.generateResetPasswordToken(
            'my.aminrezaei@gmail.com',
          );
        return pactum
          .spec()
          .withBody({
            token: resetPasswordToken,
            password: '12345',
          })
          .post('/auth/reset-password')
          .expectStatus(400);
      });
    });
    describe('Logout', () => {
      it('Should logout', async () => {
        return pactum
          .spec()
          .post('/auth/logout')
          .withCookies('$S{UserRefreshToken}')
          .expectStatus(200);
      });
      it('Should throw if no refresh token', () => {
        return pactum.spec().post('/auth/logout').expectStatus(401);
      });
    });
  });

  // describe('User', () => {
  //   describe('Get user info', () => {});
  // });

  // describe('Track', () => {
  //   describe('Add Track', () => {});
  //   describe('Edit Track', () => {});
  //   describe('Get All Tracks', () => {});
  //   describe('Get Specific Track', () => {});
  //   describe('Delete Track', () => {});
  // });
});
