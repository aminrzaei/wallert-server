import * as cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

const FRONTEND_URL = process.env.FRONTEND_URL;
const ALLOWED_ORIGINS = [FRONTEND_URL];

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: ALLOWED_ORIGINS,
      credentials: true,
    },
  });
  app.use(cookieParser());
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.listen(3000, '0.0.0.0');
}
bootstrap();
