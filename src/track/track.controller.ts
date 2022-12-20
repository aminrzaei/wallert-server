import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { ICustomRequest } from 'types';
import { AddTrackDto } from './dto';
import { TrackService } from './track.service';

@Controller('track')
export class TrackController {
  constructor(private trackService: TrackService) {}
  @UseGuards(AccessTokenGuard)
  @Post('add')
  async add(
    @Body() dto: AddTrackDto,
    @Req() req: ICustomRequest,
    @Res() res: Response,
  ) {
    const user = req.user;
    await this.trackService.createTrack(dto, user);
    res.status(HttpStatus.OK).send({
      statusCode: 200,
      message: 'ردیاب با موفقیت اضافه شد',
    });
  }
}
