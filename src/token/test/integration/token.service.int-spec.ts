import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenService } from 'src/token/token.service';

describe('TokneService Int', () => {
  let prisma: PrismaService;
  let tokenService: TokenService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = moduleRef.get(PrismaService);
    tokenService = moduleRef.get(TokenService);
    await prisma.cleanDb();
  });

  describe('generateToken()', () => {
    it.todo('should generate token');
  });
});
