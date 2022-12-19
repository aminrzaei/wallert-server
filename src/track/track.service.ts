import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as moment from 'moment';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddTrackDto } from './dto';

@Injectable()
export class TrackService {
  constructor(private prisma: PrismaService) {}
  async createTrack(dto: AddTrackDto, userId: number) {
    const { interval, query } = dto;
    const now = moment().format();
    const { postToken: lastPostToken } = await this.getLastpost(query);
    console.log(lastPostToken);
    return this.prisma.track.create({
      data: {
        interval,
        query,
        lastCheckTime: now,
        lastPostToken,
        userId,
      },
    });
  }
  async getLastpost(query: string) {
    const posts = await this.getPosts(query);
    const lastPost = posts[0];
    return { postToken: lastPost.data.token };
  }

  // @Cron(CronExpression.EVERY_MINUTE)
  @Cron(CronExpression.EVERY_10_SECONDS)
  async tracking() {
    const tracks = await this.prisma.track.findMany();
    const tracksLen = tracks.length;
    let i = 0;
    while (i < tracksLen) {
      const track = tracks[i];
      const { isActive, lastCheckTime, interval, query, lastPostToken } = track;
      i++;
      if (!this.isVaildToTrack(isActive, lastCheckTime, interval)) continue;
      const posts = await this.getPosts(query);
      const latestPosts = this.getLatestPosts(posts, lastPostToken);
      console.log(latestPosts);
      // set last time and last token
    }
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
    trackLastCheckTime: Date,
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

  getLatestPosts(posts: any, lastPostToken: string) {
    const lastPostByTokenIndex: number = posts
      .map((post) => post.data.token)
      .indexOf(lastPostToken);
    if (lastPostByTokenIndex === -1) {
      return this.extractPostsData(posts);
    }
    return this.extractPostsData(posts.slice(0, lastPostByTokenIndex));
  }

  extractPostsData(posts) {
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
      };
    });
  }
}
