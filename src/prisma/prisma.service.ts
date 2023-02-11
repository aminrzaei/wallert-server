import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get('database.url'),
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDb() {
    if (process.env.NODE_ENV === 'production') return;
    // const models = Reflect.ownKeys(this).filter((key) => key[0] !== '_');
    // return Promise.all(models.map((modelKey) => this[modelKey].deleteMany()));

    return this.$transaction([
      this.order.deleteMany(),
      this.token.deleteMany(),
      this.track.deleteMany(),
      this.user.deleteMany(),
    ]);
  }
}
