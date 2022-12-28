import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { ICustomRequest } from '../../types';
import { Response } from 'express';

@Controller('user')
export class UserController {
  /**
   * Get user info
   * @param req
   * @param res
   */
  @UseGuards(AccessTokenGuard)
  @Get('me')
  me(@Req() req: ICustomRequest, @Res() res: Response) {
    res.send({ statusCode: 200, user: req.user });
  }
}
