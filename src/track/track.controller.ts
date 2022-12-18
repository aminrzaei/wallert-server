import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { IUserRequest } from 'types';
import { AddTrackDto } from './dto';

@Controller('track')
export class TrackController {
  @UseGuards(AccessTokenGuard)
  @Post('add')
  add(
    @Body() dto: AddTrackDto,
    @Req() req: IUserRequest,
    @Res() res: Response,
  ) {
    console.log(dto);
    res.send(req.user);
  }
}
