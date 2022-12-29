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
  }, 10000);

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    describe('Send verification email', () => {
      it('Should send verification email', async () => {
        return pactum
          .spec()
          .post('/auth/send-verification-email')
          .withBody({ email: 'my.aminrezaei@gmail.com' })
          .expectStatus(200);
      }, 8000);
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
      it('Should send forget password email', async () => {
        return pactum
          .spec()
          .post('/auth/forgot-password')
          .withBody({ email: 'my.aminrezaei@gmail.com' })
          .expectStatus(200);
      }, 8000);
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
      it('Should logout', () => {
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

  describe('User', () => {
    describe('Get user info', () => {
      it('Should get user infos', () => {
        return pactum
          .spec()
          .get('/user/me')
          .withHeaders('Authorization', 'Bearer $S{UserAccessToken}')
          .expectStatus(200)
          .expectJsonSchema({
            type: 'object',
            properties: {
              user: {
                type: 'object',
              },
            },
          });
      });
      it('Should throw if invalid auth header', () => {
        return pactum
          .spec()
          .get('/user/me')
          .withHeaders('Authorization', 'Bearer INVALIDTOKEN')
          .expectStatus(401);
      });
      it('Should throw if no auth header', () => {
        return pactum.spec().get('/user/me').expectStatus(401);
      });
    });
  });

  describe('Track', () => {
    describe('Add Track', () => {
      it('Should add track', () => {
        pactum.handler.addCaptureHandler('trackid', (ctx) => {
          return ctx.res.body.track.id;
        });
        return pactum
          .spec()
          .post('/track')
          .withBody({
            title: 'Some fancy title',
            interval: 5,
            query: 'https://divar.ir/s/iran?cities=14%2C843',
          })
          .withHeaders('Authorization', 'Bearer $S{UserAccessToken}')
          .expectStatus(201)
          .stores('TrackId', '#trackid');
      });
      it('Should throw if no auth header', () => {
        return pactum
          .spec()
          .post('/track')
          .withBody({
            title: 'Some fancy title',
            interval: 5,
            query: 'https://divar.ir/s/iran?cities=14%2C843',
          })
          .expectStatus(401);
      });
      it('Should throw if invalid auth header', () => {
        return pactum
          .spec()
          .post('/track')
          .withBody({
            title: 'Some fancy title',
            interval: 5,
            query: 'https://divar.ir/s/iran?cities=14%2C843',
          })
          .withHeaders('Authorization', 'Bearer INVALIDTOKEN')
          .expectStatus(401);
      });
      it('Should throw if no title', () => {
        return pactum
          .spec()
          .post('/track')
          .withBody({
            interval: 5,
            query: 'https://divar.ir/s/iran?cities=14%2C843',
          })
          .withHeaders('Authorization', 'Bearer $S{UserAccessToken}')
          .expectStatus(400);
      });
      it('Should throw if too short title', () => {
        return pactum
          .spec()
          .post('/track')
          .withBody({
            title: 'S',
            interval: 5,
            query: 'https://divar.ir/s/iran?cities=14%2C843',
          })
          .withHeaders('Authorization', 'Bearer $S{UserAccessToken}')
          .expectStatus(400);
      });
      it('Should throw if no interval', () => {
        return pactum
          .spec()
          .post('/track')
          .withBody({
            title: 'Some fancy title',
            query: 'https://divar.ir/s/iran?cities=14%2C843',
          })
          .withHeaders('Authorization', 'Bearer $S{UserAccessToken}')
          .expectStatus(400);
      });
      it('Should throw if invalid interval', () => {
        return pactum
          .spec()
          .post('/track')
          .withBody({
            title: 'Some fancy title',
            interval: 7,
            query: 'https://divar.ir/s/iran?cities=14%2C843',
          })
          .withHeaders('Authorization', 'Bearer $S{UserAccessToken}')
          .expectStatus(400);
      });
      it('Should throw if no query', () => {
        return pactum
          .spec()
          .post('/track')
          .withBody({
            title: 'Some fancy title',
            interval: 5,
          })
          .withHeaders('Authorization', 'Bearer $S{UserAccessToken}')
          .expectStatus(400);
      });
      it('Should throw if invalid query', () => {
        return pactum
          .spec()
          .post('/track')
          .withBody({
            title: 'Some fancy title',
            interval: 5,
            query: 'INVALIDQUERY',
          })
          .withHeaders('Authorization', 'Bearer $S{UserAccessToken}')
          .expectStatus(400);
      });
      it('Should throw if not divar query', () => {
        return pactum
          .spec()
          .post('/track')
          .withBody({
            title: 'Some fancy title',
            interval: 5,
            query: 'https://www.google.com',
          })
          .withHeaders('Authorization', 'Bearer $S{UserAccessToken}')
          .expectStatus(400);
      });
    });
    describe('Edit Track Status By Id', () => {
      it('Should edit track status by id', () => {
        return pactum
          .spec()
          .patch('/track/{id}/status')
          .withPathParams('id', '$S{TrackId}')
          .withHeaders('Authorization', 'Bearer $S{UserAccessToken}')
          .withBody({
            isActive: false,
          })
          .expectStatus(200)
          .expectJsonLike({
            isActive: true,
          });
      });
      it('Should throw if no auth header', () => {
        return pactum
          .spec()
          .patch('/track/{id}/status')
          .withPathParams('id', '$S{TrackId}')
          .withBody({
            isActive: false,
          })
          .expectStatus(401);
      });
      it('Should throw if invalid auth header', () => {
        return pactum
          .spec()
          .patch('/track/{id}/status')
          .withPathParams('id', '$S{TrackId}')
          .withHeaders('Authorization', 'Bearer INVALIDTOKEN')
          .withBody({
            isActive: false,
          })
          .expectStatus(401);
      });
      it('Should throw if not found id param', () => {
        return pactum
          .spec()
          .patch('/track/{id}/status')
          .withPathParams('id', 2556)
          .withHeaders('Authorization', 'Bearer $S{UserAccessToken}')
          .withBody({
            isActive: false,
          })
          .expectStatus(404);
      });
      it('Should throw if no id param', () => {
        return pactum
          .spec()
          .patch('/track/{id}/status')
          .withHeaders('Authorization', 'Bearer $S{UserAccessToken}')
          .withBody({
            isActive: false,
          })
          .expectStatus(400);
      });
      it('Should throw if no body', () => {
        return pactum
          .spec()
          .patch('/track/{id}/status')
          .withPathParams('id', '$S{TrackId}')
          .withHeaders('Authorization', 'Bearer $S{UserAccessToken}')
          .expectStatus(400);
      });
      it('Should throw if invalid active status', () => {
        return pactum
          .spec()
          .patch('/track/{id}/status')
          .withPathParams('id', '$S{TrackId}')
          .withHeaders('Authorization', 'Bearer $S{UserAccessToken}')
          .withBody({
            isActive: 'INVALIDSTATUS',
          })
          .expectStatus(400);
      });
    });

    describe('Get All Tracks', () => {
      it('Should get all user tracks', () => {
        return pactum
          .spec()
          .get('/track')
          .withHeaders('Authorization', 'Bearer $S{UserAccessToken}')
          .expectStatus(200)
          .expectJsonLength('tracks', 1);
      });
      it('Should throw if no auth header', () => {
        return pactum.spec().get('/track').expectStatus(401);
      });
    });
    describe('Get Specific Track', () => {
      it('Should get specific track', () => {
        return pactum
          .spec()
          .get('/track/{id}')
          .withPathParams('id', '$S{TrackId}')
          .withHeaders('Authorization', 'Bearer $S{UserAccessToken}')
          .expectStatus(200);
      });
      it('Should throw if no param', () => {
        return pactum
          .spec()
          .get('/track/{id}')
          .withHeaders('Authorization', 'Bearer $S{UserAccessToken}')
          .expectStatus(400);
      });
      it('Should throw if not found param', () => {
        return pactum
          .spec()
          .get('/track/{id}')
          .withPathParams('id', 2556)
          .withHeaders('Authorization', 'Bearer $S{UserAccessToken}')
          .expectStatus(404);
      });
      it('Should throw if no auth header', () => {
        return pactum
          .spec()
          .get('/track/{id}')
          .withPathParams('id', '$S{TrackId}')
          .expectStatus(401);
      });
      it('Should throw if invalid auth header', () => {
        return pactum
          .spec()
          .get('/track/{id}')
          .withPathParams('id', '$S{TrackId}')
          .withHeaders('Authorization', 'Bearer INVALIDTOKEN')
          .expectStatus(401);
      });
    });
    describe('Delete Track', () => {
      it('Should delete track by id', () => {
        return pactum
          .spec()
          .delete('/track/{id}')
          .withPathParams('id', '$S{TrackId}')
          .withHeaders('Authorization', 'Bearer $S{UserAccessToken}')
          .expectStatus(200);
      });
      it('Should throw if no param', () => {
        return pactum
          .spec()
          .delete('/track/{id}')
          .withHeaders('Authorization', 'Bearer $S{UserAccessToken}')
          .expectStatus(400);
      });
      it('Should throw if not foumd param', () => {
        return pactum
          .spec()
          .delete('/track/{id}')
          .withPathParams('id', 2556)
          .withHeaders('Authorization', 'Bearer $S{UserAccessToken}')
          .expectStatus(404);
      });
      it('Should throw if no auth header', () => {
        return pactum
          .spec()
          .delete('/track/{id}')
          .withPathParams('id', '$S{TrackId}')
          .expectStatus(401);
      });
      it('Should throw if invalid auth header', () => {
        return pactum
          .spec()
          .delete('/track/{id}')
          .withPathParams('id', '$S{TrackId}')
          .withHeaders('Authorization', 'Bearer INVALID')
          .expectStatus(401);
      });
    });
  });
});
