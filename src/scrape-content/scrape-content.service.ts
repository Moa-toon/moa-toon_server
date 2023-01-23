import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { load } from 'cheerio';
import {
  PlatformType,
  UpdateDayCode,
  Webtoon,
  WebtoonAdditionalInfo,
  WebtoonEpisodeInfo,
  WebtoonSimpleInfo,
} from 'src/common/types/contents';

@Injectable()
export class ScrapeContentService {
  private readonly NAVER_WEBTOON_BASE_URL = 'https://m.comic.naver.com';
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

  async getContentsByPlatform(
    platform: PlatformType,
    updateDay: UpdateDayCode,
  ) {
    if (platform === 'naver') {
      console.log('네이버 웹툰');
      return this.getNaverWebtoons(this.NAVER_WEBTOON_URL, updateDay);
    }
  }

  async getNaverWebtoons(baseUrl: string, updateDay: UpdateDayCode) {
    console.log(updateDay);
    if (updateDay === 'daily') {
      console.log('데일리 웹툰 데이터 수집');
      // Daily 웹툰 콘텐츠 간략 정보 스크래핑
      const dailyWebtoonsSimpleData = await this.scrapeNaverWebtoonSimpleData(
        `${baseUrl}/weekday?week=dailyPlus`,
        updateDay,
      );
      const dailyWebtoonsAdditionalData =
        await this.scrapeNaverWebtoonsAdditionalData(dailyWebtoonsSimpleData);
      const dailyWebtoons = this.makeWebtoonData(
        dailyWebtoonsSimpleData,
        dailyWebtoonsAdditionalData,
      );
      return dailyWebtoons;
    } else if (this.weeklyDays.includes(updateDay)) {
      console.log('요일별 웹툰 데이터 수집');
      const weeklyDayWebtoonsSimpleData =
        await this.scrapeNaverWebtoonSimpleData(
          `${baseUrl}/weekday?week=${updateDay}`,
          updateDay,
        );

      const weeklyDayWebtoonsAdditionalData =
        await this.scrapeNaverWebtoonsAdditionalData(
          weeklyDayWebtoonsSimpleData,
        );

      const weeklyDayWebtoons = this.makeWebtoonData(
        weeklyDayWebtoonsSimpleData,
        weeklyDayWebtoonsAdditionalData,
      );
      console.log(weeklyDayWebtoons.length);
      return weeklyDayWebtoons;
    } else if (updateDay === 'finished') {
      console.log('완결 웹툰 스크래핑 작업');
    }
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
          } as Webtoon;
          webtoons.push(webtoon);
          continue;
        }
      }
    }
    return webtoons;
  }

  async scrapeNaverWebtoonSimpleData(
    url: string,
    updateDay: UpdateDayCode,
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
      const simpleInfo = await this.getWebtoonItemInfo(
        $,
        webtoonItem,
        updateDay,
      );
      webtoons.push(simpleInfo);
    }
    return webtoons;
  }

  async scrapeNaverWebtoonsAdditionalData(
    webtoons: Array<WebtoonSimpleInfo>,
  ): Promise<Array<WebtoonAdditionalInfo>> {
    return Promise.all(
      webtoons.map((webtoon) =>
        this.scrapeNaverWebtoonAdditionalData(webtoon.url),
      ),
    );
  }

  async scrapeNaverWebtoonAdditionalData(
    url: string,
  ): Promise<WebtoonAdditionalInfo> {
    // url에 대해 axios.get 요청
    const htmlData = await this.getHtmlData(url);
    const $ = this.loadHtml(htmlData);
    const summary = $('.section_toon_info .info_front .summary').text().trim();
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
    const pageCount = $('#ct > div.paging_type2 > em > span').text();

    // 회차 정보 수집
    const episodes = [];
    const episodeItemList = $('#ct > ul.section_episode_list li.item');
    for (const episodeItem of episodeItemList) {
      const episodeInfo = this.getWebtoonEpisode($, episodeItem);
      episodes.push(episodeInfo);
    }

    const pages = Array.from({ length: parseInt(pageCount) }, (v, i) => i + 2);
    const episodesOfAllPages = await Promise.all(
      pages.map(async (page) => {
        return (async () => {
          const episodesOfPage: Array<WebtoonEpisodeInfo> = [];
          const htmlData = await this.getHtmlData(`${url}&page=${page}`);
          const $ = this.loadHtml(htmlData);

          const episodeItemList = $('#ct > ul.section_episode_list li.item');
          for (const episodeItem of episodeItemList) {
            const episodeInfo = this.getWebtoonEpisode($, episodeItem);
            episodesOfPage.push(episodeInfo);
          }
          return episodesOfPage;
        })();
      }),
    );
    episodesOfAllPages.forEach((episodesOfPage) =>
      episodes.push(...episodesOfPage),
    );
    return {
      url,
      summary,
      description,
      genres: [mainGenre, subGenre],
      episodes,
    };
  }

  async getHtmlData(url: string): Promise<string> {
    try {
      const axiosConfig = {
        port: null, // port: 80
        headers: {
          authority: 'm.comic.naver.com',
          scheme: 'https',
          accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
          'accept-encoding': 'gzip, deflate, br',
          'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
          'cache-control': 'no-cache',
          'sec-fetch-dest': 'document',
          'sec-fetch-mode': 'navigate',
          'sec-fetch-site': 'same-origin',
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
          connection: 'keep-alive',
        },
      };
      const html: { data: string } = await axios.get(url, axiosConfig);
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
    updateDay: UpdateDayCode,
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
      url: `https://m.comic.naver.com${contentUrl}&sortOrder=ASC`,
      thumbnailPath,
      platform: PlatformType.naver,
      updateDays: [updateDay],
      additional: {
        isNew: isNewWebtoon,
        isAdult: isAdultWebtoon,
        isPaused: isPausedWebtoon,
        isUpdated: isUpdatedWebtoon,
      },
    };
  }

  getWebtoonEpisode(
    $: cheerio.Root,
    element: cheerio.Element,
  ): WebtoonEpisodeInfo {
    const name = $(element).find('div.info .name strong').text().trim();
    const additionalUrl = $(element).find('a').attr('href');
    const thumbnailPath = $(element).find('div.thumbnail img').attr('src');
    const createDate = $(element)
      .find('div.info div.detail .date')
      .text()
      .trim();
    const isFree =
      $(element).find('div.thumbnail > span > span').text().trim() !==
      '유료만화';
    return {
      name,
      url: `${this.NAVER_WEBTOON_BASE_URL}${additionalUrl}`,
      thumbnailPath,
      createDate,
      isFree,
    };
  }
}
