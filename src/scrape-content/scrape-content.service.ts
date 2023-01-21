import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { load } from 'cheerio';

type Webtoon = {
  id: string;
  title: string;
  authors: Array<string>;
  url: string;
  thumbnailPath: string;
  platform: 'naver' | 'kakao' | 'kakaopage';
  updateDays: Array<string>;
};

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

  async scrapeNaverDailyWebtoons(url: string): Promise<Array<Webtoon>> {
    console.log('네이버 데일리 웹툰 콘텐츠 스크래핑 작업!!!');
    console.log(`타겟 url: ${url}`);
    // url에 대해 axios.get 요청
    const htmlData = await this.getHtmlData(url);
    const $ = this.loadHtml(htmlData);

    const webtoonItemList = $(
      '#ct > .section_list_toon > ul.list_toon > li.item > a',
    );
    const webtoons: Array<Webtoon> = [];
    console.log(`콘텐츠 개수: ${webtoonItemList.length}`);

    for (const webtoonItem of webtoonItemList) {
      const webtoon = this.getWebtoonItemInfo($, webtoonItem);
      webtoons.push(webtoon);
    }

    return webtoons;
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

  loadHtml(html: string): cheerio.Root {
    return load(html);
  }

  getWebtoonItemInfo($: cheerio.Root, element: cheerio.Element): Webtoon {
    const webtoonElem = $(element);
    const contentUrl = webtoonElem.attr('href');
    const contentId = contentUrl.split('?titleId=')[1].split('&')[0];
    const title = webtoonElem
      .find('div.info > div > strong > span')
      .text()
      .trim();
    const thumbnailPath = webtoonElem.find('.thumbnail img').attr('src');
    const authors = webtoonElem
      .find('div.info > span.author')
      .text()
      .replace(/\n/g, '')
      .replace(/\t/g, '')
      .split(' / ');
    return {
      id: contentId,
      title,
      authors,
      url: `https://m.comic.naver.com${contentUrl}`,
      thumbnailPath,
      platform: 'naver',
      updateDays: ['daily'],
    };
  }
}
