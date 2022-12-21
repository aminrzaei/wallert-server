import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { ICustomRequest } from 'types';
import { AddTrackDto, ToggleStatusDto, DeleteTrackDto } from './dto';
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

  @UseGuards(AccessTokenGuard)
  @Patch('toggle-status')
  async toggleTrackStatus(
    @Body() dto: ToggleStatusDto,
    @Req() req: ICustomRequest,
    @Res() res: Response,
  ) {
    const { isActive, id } = dto;
    const userId = req.user.id;
    const IS_ACTIVE_STATUS = {
      true: 'فعال',
      false: 'غیرفعال',
    };
    const newStatus = !isActive;
    const track = await this.trackService.getTrackById(id, userId);
    const newTrack = await this.trackService.updateTrack(track.id, {
      isActive: newStatus,
    });
    res.status(HttpStatus.OK).send({
      statusCode: 200,
      message: `پیگیری با موفقیت ${
        IS_ACTIVE_STATUS[`${newTrack.isActive}`]
      } شد`,
      isActive: newTrack.isActive,
    });
  }

  @UseGuards(AccessTokenGuard)
  @Delete('delete')
  async deleteTrack(
    @Body() dto: DeleteTrackDto,
    @Req() req: ICustomRequest,
    @Res() res: Response,
  ) {
    const { id } = dto;
    const userId = req.user.id;
    const track = await this.trackService.getTrackById(id, userId);
    const deletedTrack = await this.trackService.deleteTrack(track.id);
    res.status(HttpStatus.OK).send({
      statusCode: 200,
      message: `پیگیری ${deletedTrack.title} با موفقیت حذف شد`,
    });
  }
}
