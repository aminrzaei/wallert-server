import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Track } from '@prisma/client';
import * as moment from 'moment';
import { EmailService } from 'src/email/email.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ContactType, Post, RequestUser } from 'types';
import { AddTrackDto } from './dto';

@Injectable()
export class TrackService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}
  async createTrack(dto: AddTrackDto, user: RequestUser) {
    const { title, interval, query } = dto;
    const { postToken: lastPostToken } = await this.getLastpost(query);
    String;
    String;
    return this.prisma.track.create({
      data: {
        title,
        interval,
        query,
        contactType: ContactType.EMAIL,
        contactAddress: user.email,
        lastCheckTime: moment().format(),
        lastPostToken,
        userId: user.id,
      },
    });
  }

  async getLastpost(query: string) {
    const posts = await this.getPosts(query);
    const lastPost = posts[0];
    return { postToken: lastPost.data.token };
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async tracking() {
    const tracks = await this.prisma.track.findMany();
    const tracksLen = tracks.length;
    let i = 0;
    while (i < tracksLen) {
      const track = tracks[i];
      const {
        id,
        title,
        isActive,
        contactType,
        contactAddress,
        lastCheckTime,
        interval,
        query,
        lastPostToken,
      } = track;
      i++;
      if (!this.isVaildToTrack(isActive, lastCheckTime, interval)) continue;
      const posts = await this.getPosts(query);
      const latestPosts = this.getLatestPosts(posts, lastPostToken);
      if (latestPosts.length !== 0) {
        const updateTrackData = {
          lastCheckTime: moment().format(),
          lastPostToken: latestPosts[0].token as string,
        };
        await this.updateTrack(id, updateTrackData);
        if (contactType === ContactType.EMAIL) {
          await this.emailService.sendTrackEmail(
            contactAddress,
            latestPosts,
            title,
          );
        }
      }
    }
  }

  updateTrack(trackId: number, updateData: Partial<Track>): Promise<Track> {
    return this.prisma.track.update({
      where: {
        id: trackId,
      },
      data: updateData,
    });
  }

  deleteTrack(trackId: number): Promise<Track> {
    return this.prisma.track.delete({
      where: {
        id: trackId,
      },
    });
  }

  async getUserTracks(userId: number): Promise<Track[]> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        tracks: true,
      },
    });
    return user.tracks;
  }

  async getTrackById(id: number, userId: number): Promise<Track> | never {
    const track = await this.prisma.track.findFirst({
      where: {
        id,
        userId,
      },
    });
    if (!track) throw new NotFoundException('پیگیری ای با این شسناسه یافت نشد');
    return track;
  }

  async getPosts(query: string) {
    const API_URL = 'https://api.divar.ir/v8/web-search/';
    const WEB_URL = 'https://divar.ir/s/';
    const apiQuery = query.replace(WEB_URL, API_URL);
    const response = await fetch(apiQuery);
    const body = await response.json();
    return body.web_widgets.post_list;
  }

  isVaildToTrack(
    isTrackActive: boolean,
    trackLastCheckTime: string,
    trackInterval: number,
  ): boolean {
    if (!isTrackActive) return false;
    const now = moment();
    const lastCheckPlusInterval = moment(trackLastCheckTime).add(
      trackInterval,
      'minute',
    );
    if (now < lastCheckPlusInterval) return false;
    return true;
  }

  getLatestPosts(posts: any, lastPostToken: string): Post[] {
    const lastPostByTokenIndex: number = posts
      .map((post) => post.data.token)
      .indexOf(lastPostToken);
    if (lastPostByTokenIndex === -1) {
      return this.extractPostsData(posts);
    }
    return this.extractPostsData(posts.slice(0, lastPostByTokenIndex));
  }

  extractPostsData(posts): Post[] {
    const POST_URl = 'https://divar.ir/v/';
    return posts.map((post) => {
      const postData = post.data;
      return {
        image: postData?.image_url[0]?.src || '',
        title: postData.title,
        top_description: postData.top_description_text,
        middle_description: postData.middle_description_text,
        city: postData.action.payload.web_info.city_persian,
        category: postData.action.payload.web_info.category_slug_persian,
        token: postData.token,
        link: POST_URl + postData.token,
      };
    });
  }
}
