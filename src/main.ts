import * as cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

const FRONTEND_URL = process.env.FRONTEND_URL;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: FRONTEND_URL,
      allowedHeaders:
        'Origin, X-Requested-With, Content-Type, Accept ,Authorization',
      methods: 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      credentials: true,
    },
  });
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.listen(3000, '0.0.0.0');
}
bootstrap();
