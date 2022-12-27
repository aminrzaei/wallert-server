import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as pactum from 'pactum';
import { AppModule } from './../src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

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
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    describe('Send Verification Email', () => {
      it.todo('Should send verification email');
    });
    describe('Register', () => {});
    describe('Login', () => {});
    describe('Refresh Tokens', () => {});
    describe('Forgot Password', () => {});
    describe('Reset Password', () => {});
    describe('Logout', () => {});
  });

  describe('User', () => {
    describe('Get user info', () => {});
  });

  describe('Track', () => {
    describe('Add Track', () => {});
    describe('Edit Track', () => {});
    describe('Get All Tracks', () => {});
    describe('Get Specific Track', () => {});

    describe('Delete Track', () => {});
  });
});
