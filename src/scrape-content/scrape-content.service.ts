import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ScrapeContentService {
  private readonly NAVER_WEBTOON_URL = 'https://m.comic.naver.com/webtoon';
  async getContentsByPlatform(platform: string) {
    if (platform === 'naver') {
      console.log('네이버 웹툰');
      return this.getNaverWebtoons(this.NAVER_WEBTOON_URL);
    }

    return platform;
  }

  async getNaverWebtoons(baseUrl: string) {
    // Daily 웹툰 콘텐츠 스크래핑
    const dailyWebtoons = await this.scrapeNaverDailyWebtoons(
      `${baseUrl}/weekday?week=dailyPlus`,
    );
    return dailyWebtoons;
  }

  async scrapeNaverDailyWebtoons(url: string) {
    console.log('네이버 데일리 웹툰 콘텐츠 스크래핑 작업!!!');
    console.log(`타겟 url: ${url}`);
    // url에 대해 axios.get 요청
    const htmlData = await this.getHtmlData(url);

    return htmlData;
  }

  async getHtmlData(url: string): Promise<string> {
    try {
      const html: { data: string } = await axios.get(url);
      return html.data;
    } catch (err) {
      console.error(err);
      return err.message;
    }
  }
}
