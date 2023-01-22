import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { load } from 'cheerio';

type WebtoonSimpleInfo = {
  id: string;
  title: string;
  authors: Array<string>;
  url: string;
  thumbnailPath: string;
  platform: 'naver' | 'kakao' | 'kakaopage';
  updateDays: Array<string>;
  additional: {
    isNew: boolean;
    isAdult: boolean;
    isPaused: boolean;
    isUpdated: boolean;
  };
};

type WebtoonAdditionalInfo = {
  url: string;
  summary: string;
  description: string;
  mainGenre: string;
  subGenre: string;
};

type Webtoon = {
  id: string;
  title: string;
  authors: Array<string>;
  url: string;
  thumbnailPath: string;
  platform: 'naver' | 'kakao' | 'kakaopage';
  updateDays: Array<string>;
  additional: {
    isNew: boolean;
    isAdult: boolean;
    isPaused: boolean;
    isUpdated: boolean;
  };
  summary: string;
  description: string;
  mainGenre: string;
  subGenre: string;
};

@Injectable()
export class ScrapeContentService {
  private readonly NAVER_WEBTOON_URL = 'https://m.comic.naver.com/webtoon';
  private readonly weeklyDays = [
    'mon',
    'tue',
    'wed',
    'thu',
    'fri',
    'sat',
    'sun',
  ];

  async getContentsByPlatform(platform: string) {
    if (platform === 'naver') {
      console.log('네이버 웹툰');
      return this.getNaverWebtoons(this.NAVER_WEBTOON_URL);
    }

    return platform;
  }

  async getNaverWebtoons(baseUrl: string) {
    // Daily 웹툰 콘텐츠 간략 정보 스크래핑
    const dailyWebtoonsSimpleData = await this.scrapeNaverWebtoonSimpleData(
      `${baseUrl}/weekday?week=dailyPlus`,
    );
    const weeklyWebtoonsSimpleData =
      await this.scrapeNaverWeeklyWebtoonsSimpleData(baseUrl, this.weeklyDays);
    // Daily 웹툰 콘텐츠 추가 정보 스크래핑
    // Promise.all
    const dailyWebtoonsAdditionalData =
      await this.scrapeNaverDailyWebtoonsAdditionalData(
        dailyWebtoonsSimpleData,
      );

    const dailyWebtoons = this.makeWebtoonData(
      dailyWebtoonsSimpleData,
      dailyWebtoonsAdditionalData,
    );

    return { weeklyWebtoonsSimpleData, dailyWebtoons };
  }

  makeWebtoonData(
    simpleData: Array<WebtoonSimpleInfo>,
    additionalData: Array<WebtoonAdditionalInfo>,
  ): Array<Webtoon> {
    const webtoons: Webtoon[] = [];
    for (let i = 0; i < simpleData.length; i++) {
      const webtoonSimpleData = simpleData[i];

      for (let j = i; j < additionalData.length; j++) {
        const webtoonAdditionalData = additionalData[j];
        if (webtoonSimpleData.url === webtoonAdditionalData.url) {
          const webtoon = {
            ...webtoonSimpleData,
            ...webtoonAdditionalData,
          };
          webtoons.push(webtoon);
          continue;
        }
      }
    }
    return webtoons;
  }

  async scrapeNaverWebtoonSimpleData(
    url: string,
  ): Promise<Array<WebtoonSimpleInfo>> {
    // url에 대해 axios.get 요청
    const htmlData = await this.getHtmlData(url);
    const $ = this.loadHtml(htmlData);

    const webtoonItemList = $(
      '#ct > .section_list_toon > ul.list_toon > li.item > a',
    );
    let webtoons: Array<WebtoonSimpleInfo> = [];
    console.log(`콘텐츠 개수: ${webtoonItemList.length}`);

    for (const webtoonItem of webtoonItemList) {
      const simpleInfo = await this.getWebtoonItemInfo($, webtoonItem);
      webtoons.push(simpleInfo);
    }

    return webtoons;
  }

  async scrapeNaverWeeklyWebtoonsSimpleData(
    baseUrl: string,
    weeklyDays: Array<string>,
  ) {
    const result: Array<WebtoonSimpleInfo> = [];
    for (const day of weeklyDays) {
      const daySimpleData = await this.scrapeNaverWebtoonSimpleData(
        `${baseUrl}/weekday?week=${day}`,
      );
      result.push(...daySimpleData);
    }
    return result;
  }

  async scrapeNaverDailyWebtoonsAdditionalData(
    webtoons: Array<WebtoonSimpleInfo>,
  ): Promise<Array<WebtoonAdditionalInfo>> {
    return Promise.all(
      webtoons.map((webtoon) =>
        this.scrapeNaverDailyWebtoonAdditionalData(webtoon.url),
      ),
    );
  }

  async scrapeNaverDailyWebtoonAdditionalData(
    url: string,
  ): Promise<WebtoonAdditionalInfo> {
    // url에 대해 axios.get 요청
    const htmlData = await this.getHtmlData(url);
    const $ = this.loadHtml(htmlData);
    const summary = $('.section_toon_info .info_back > .summary').text().trim();
    const description = $('.section_toon_info .info_back > .summary > p')
      .text()
      .trim();
    const mainGenre = $(
      '.section_toon_info .info_back .detail .genre dd span.length',
    )
      .text()
      .trim();
    const subGenre = $(
      '.section_toon_info .info_back .detail .genre dd ul.list_detail li',
    )
      .text()
      .trim();
    return { url, summary, description, mainGenre, subGenre };
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

  getWebtoonItemInfo(
    $: cheerio.Root,
    element: cheerio.Element,
  ): WebtoonSimpleInfo {
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
    const badgeAreaText = webtoonElem.find('span.area_badge').text();
    const isNewWebtoon = badgeAreaText.includes('신작');
    const isAdultWebtoon = badgeAreaText.includes('청유물');

    const titleBoxText = webtoonElem.find('div.title_box').text();
    const isPausedWebtoon = titleBoxText.includes('휴재');
    const isUpdatedWebtoon = titleBoxText.includes('업데이트');
    return {
      id: contentId,
      title,
      authors,
      url: `https://m.comic.naver.com${contentUrl}`,
      thumbnailPath,
      platform: 'naver',
      updateDays: ['daily'],
      additional: {
        isNew: isNewWebtoon,
        isAdult: isAdultWebtoon,
        isPaused: isPausedWebtoon,
        isUpdated: isUpdatedWebtoon,
      },
    };
  }
}
