import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { ICustomRequest } from 'types';
import { AddTrackDto, UpdateStatusDto } from './dto';
import { TrackService } from './track.service';

@Controller('track')
export class TrackController {
  constructor(private trackService: TrackService) {}

  /**
   * Create a track
   * @param dto
   * @param req
   * @param res
   */
  @UseGuards(AccessTokenGuard)
  @Post('')
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

  /**
   * Update a track active status
   * @param params
   * @param dto
   * @param req
   * @param res
   */
  @UseGuards(AccessTokenGuard)
  @Patch(':id')
  async updateTrackStatus(
    @Param() params: { id: string },
    @Body() dto: UpdateStatusDto,
    @Req() req: ICustomRequest,
    @Res() res: Response,
  ) {
    const { isActive } = dto;
    const trackId = Number(params.id);
    const userId = req.user.id;
    const IS_ACTIVE_STATUS = {
      true: 'فعال',
      false: 'غیرفعال',
    };
    const newStatus = !isActive;
    const track = await this.trackService.getTrackById(trackId, userId);
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

  /**
   * Delete a track by id
   * @param params
   * @param req
   * @param res
   */
  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  async deleteTrack(
    @Param() params: { id: string },
    @Req() req: ICustomRequest,
    @Res() res: Response,
  ) {
    const trackId = Number(params.id);
    const userId = req.user.id;
    const track = await this.trackService.getTrackById(trackId, userId);
    const deletedTrack = await this.trackService.deleteTrack(track.id);
    res.status(HttpStatus.OK).send({
      statusCode: 200,
      message: `پیگیری ${deletedTrack.title} با موفقیت حذف شد`,
    });
  }

  /**
   * Get all user tracks
   * @param req
   * @param res
   */
  @UseGuards(AccessTokenGuard)
  @Get('')
  async getUserTracks(@Req() req: ICustomRequest, @Res() res: Response) {
    const userId = req.user.id;
    const tracks = await this.trackService.getUserTracks(userId);
    res.status(HttpStatus.OK).send({
      statusCode: 200,
      tracks,
    });
  }

  /**
   * Get one track by id
   * @param params
   * @param req
   * @param res
   */

  @UseGuards(AccessTokenGuard)
  @Get(':id')
  async getTrack(
    @Param() params: { id: string },
    @Req() req: ICustomRequest,
    @Res() res: Response,
  ) {
    const trackId = Number(params.id);
    const userId = req.user.id;
    const track = await this.trackService.getTrackById(trackId, userId);
    res.status(HttpStatus.OK).send({
      statusCode: 200,
      track,
    });
  }
}
