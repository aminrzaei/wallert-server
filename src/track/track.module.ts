import { Module } from '@nestjs/common';
import { EmailModule } from 'src/email/email.module';
import { TrackController } from './track.controller';
import { TrackService } from './track.service';

@Module({
  imports: [EmailModule],
  controllers: [TrackController],
  providers: [TrackService],
})
export class TrackModule {}
