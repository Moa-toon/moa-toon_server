import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import axios from 'axios';
import { load } from 'cheerio';
import {
  kakaoWebtoonAxiosConfig,
  KAKAO_WEBTOON_API_BASE_URL,
  KAKAO_WEBTOON_BASE_URL,
  KAKAO_WEBTOON_DETAIL_API_BASE_URL,
  KAKAO_WEBTOON_EPISODE_API_BASE_URL,
  KAKAO_WEBTOON_EPISODE_BASE_URL,
} from 'src/common/common.constant';
import {
  Contents,
  CookieOption,
  OriginalType,
  OriginalTypeCode,
  Platforms,
  PlatformType,
  UpdateDayCode,
  UpdateDays,
  UpdateWeekDaysKor,
  Webtoon,
  WebtoonAdditionalInfo,
  WebtoonAuthorType,
  WebtoonEpisodeInfo,
  WebtoonSimpleInfo,
} from 'src/common/types/contents';
import { extractContentId } from 'src/common/utils/extractContentId';
import { getAgeLimit } from 'src/common/utils/getAgeLimit';
import { getContentType } from 'src/common/utils/getContentType';
import { SortOption } from '../admin/dto/request';

@Injectable()
export class ScrapeContentService {
  private readonly NAVER_WEBTOON_BASE_URL = 'https://m.comic.naver.com';
  private readonly NAVER_WEBTOON_PC_BASE_URL = 'https://comic.naver.com';
  private readonly NAVER_WEBTOON_URL = 'https://m.comic.naver.com/webtoon';
  private readonly weekdays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  private getApiBaseUrlByPlatform(platform: PlatformType): string {
    switch (platform) {
      case Platforms.naver:
        return 'https://m.comic.naver.com';
      case Platforms.kakao:
        return 'https://gateway-kw.kakao.com';
      default:
        throw new BadRequestException('invalid platform');
    }
  }

  private isWeekdayContent(updateDay: UpdateDayCode): boolean {
    return this.weekdays.includes(updateDay);
  }

  private getApiPageUrl(
    platform: PlatformType,
    updateDay: UpdateDayCode,
    originalType: OriginalTypeCode,
  ): string {
    if (platform === Platforms.naver) {
      if (this.isWeekdayContent(updateDay)) return `weekday?week=${updateDay}`;
      else if (updateDay === UpdateDays.daily) return `weekday?week=dailyPlus`;
      else if (updateDay === UpdateDays.finished) return `finish`;
    } else if (platform === Platforms.kakao) {
      if (originalType === OriginalType.webtoon) {
        if (this.isWeekdayContent(updateDay)) return `pages/general-weekdays`;
        else if (updateDay === UpdateDays.finished)
          return `sections?placement=channel_completed`;
      } else if (originalType === OriginalType.novel) {
        if (this.isWeekdayContent(updateDay))
          return `sections?placement=novel_completed`;
        else if (updateDay === UpdateDays.finished)
          return `pages/novel-weekdays`;
      }
    }
  }

  createGetContentListReqUrl(
    platform: PlatformType,
    updateDay: UpdateDayCode,
    originalType: OriginalTypeCode,
  ): string {
    const apiBaseUrl = this.getApiBaseUrlByPlatform(platform);
    const apiPageUrl = this.getApiPageUrl(platform, updateDay, originalType);
    return `${apiBaseUrl}/${apiPageUrl}`;
  }

  getKakaoContentApiAdditionalUrl(
    originalType: OriginalTypeCode,
    updateDay: UpdateDayCode,
  ) {
    if (originalType === OriginalType.webtoon) {
      if (updateDay === UpdateDays.finished) {
        // finished: /sections?placement=channel_completed
        return 'sections?placement=channel_completed';
      } else {
        // weekday: /pages/general-weekdays
        return 'pages/general-weekdays';
      }
    } else if (originalType === OriginalType.novel) {
      if (updateDay === UpdateDays.finished) {
        // finished: /sections?placement=novel_completed
        return 'sections?placement=novel_completed';
      } else {
        // weekday: /pages/novel-weekdays
        return 'pages/novel-weekdays';
      }
    }
  }

  getKakaoWebtoonEpisodeUrl = (contentId: number, sortOption: SortOption) => {
    return `${KAKAO_WEBTOON_EPISODE_API_BASE_URL}/${contentId}/episodes?offset=${sortOption.offset}&limit=${sortOption.limit}`;
  };

  async getContentsByPlatform(
    platform: PlatformType,
    updateDay: UpdateDayCode,
    originalType: OriginalTypeCode,
    cookieOption?: CookieOption,
  ) {
    if (platform === Platforms.naver) {
      console.log('네이버 웹툰');
      const cookie = cookieOption
        ? `NID_AUT=${cookieOption.nidAuth}; NID_SES=${cookieOption.nidSes};`
        : null;
      return this.getNaverWebtoons(this.NAVER_WEBTOON_URL, updateDay, cookie);
    } else if (platform === Platforms.kakao) {
      console.log('카카오 웹툰');
      const additionalUrl = this.getKakaoContentApiAdditionalUrl(
        originalType,
        updateDay,
      );
      return this.getKakaoWebtoons(
        `${KAKAO_WEBTOON_API_BASE_URL}/${additionalUrl}`,
        updateDay,
      );
    }
  }

  async getKakaoWebtoons(baseUrl: string, updateDay: UpdateDayCode) {
    const simpleData = await this.scrapeKakaoWebtoonSimpleData(
      baseUrl,
      updateDay,
    );
    const additionalData = await this.scrapeKakaoWebtoonsAdditionalData(
      simpleData,
      kakaoWebtoonAxiosConfig,
    );
    const webtoons = this.makeWebtoonData(simpleData, additionalData);
    console.log(webtoons[1]['thumbnailBackgroundPath']);
    return webtoons;
  }

  async getNaverWebtoons(
    baseUrl: string,
    updateDay: UpdateDayCode,
    cookie?: string,
  ) {
    if (updateDay === 'daily') {
      console.log('데일리 웹툰 데이터 수집');
      // Daily 웹툰 콘텐츠 간략 정보 스크래핑
      const dailyWebtoonsSimpleData = await this.scrapeNaverWebtoonSimpleData(
        `${baseUrl}/weekday?week=dailyPlus`,
        updateDay,
      );
      const dailyWebtoonsAdditionalData =
        await this.scrapeNaverWebtoonsAdditionalData(dailyWebtoonsSimpleData, {
          cookie,
        });
      const dailyWebtoons = this.makeWebtoonData(
        dailyWebtoonsSimpleData,
        dailyWebtoonsAdditionalData,
      );
      return dailyWebtoons;
    } else if (this.weekdays.includes(updateDay)) {
      console.log('요일별 웹툰 데이터 수집');
      const weeklyDayWebtoonsSimpleData =
        await this.scrapeNaverWebtoonSimpleData(
          `${baseUrl}/weekday?week=${updateDay}`,
          updateDay,
        );

      const weeklyDayWebtoonsAdditionalData =
        await this.scrapeNaverWebtoonsAdditionalData(
          weeklyDayWebtoonsSimpleData,
          { cookie },
        );

      const weeklyDayWebtoons = this.makeWebtoonData(
        weeklyDayWebtoonsSimpleData,
        weeklyDayWebtoonsAdditionalData,
      );
      console.log(weeklyDayWebtoons.length);
      return weeklyDayWebtoons;
    } else if (updateDay === 'finished') {
      console.log('완결 웹툰 스크래핑 작업');
      const pageCount = await this.getPageCount(
        `${baseUrl}/finish`,
        '#ct > div.section_list_toon > div.paging_type2 > em > span',
      );
      const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
      const webtoonsSimpleDataOfPages =
        await this.scrapeNaverWebtoonsSimpleData(pages, UpdateDays.finished);
      // 2차원 배열 => 1차원 배열
      const webtoonsSimpleData = webtoonsSimpleDataOfPages.reduce(
        (acc, curr) => [...acc, ...curr],
      );
      const webtoonsAdditionalData =
        await this.scrapeNaverWebtoonsAdditionalData(webtoonsSimpleData, {
          cookie,
        });
      const finishedWebtoons = this.makeWebtoonData(
        webtoonsSimpleData,
        webtoonsAdditionalData,
      );
      return finishedWebtoons;
    }
  }

  async getPageCount(url: string, selector: string): Promise<number> {
    const htmlData = await this.getHtmlData(url);
    const $ = this.loadHtml(htmlData);
    return parseInt($(selector).text());
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
        if (webtoonSimpleData.id === webtoonAdditionalData.contentId) {
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

  async scrapeNaverWebtoonsSimpleData(
    pages: Array<number>,
    updateDay: UpdateDayCode,
  ) {
    return Promise.all(
      pages.map((pageNumber) => {
        if (updateDay === UpdateDays.finished) {
          return this.scrapeNaverWebtoonSimpleData(
            `${this.NAVER_WEBTOON_URL}/finish?page=${pageNumber}&sort=UPDATE&genre=`,
            UpdateDays.finished,
          );
        }
      }),
    );
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
    option?: { type?: string; cookie?: string },
  ): Promise<Array<WebtoonAdditionalInfo>> {
    return Promise.all(
      webtoons.map((webtoon) =>
        this.scrapeNaverWebtoonAdditionalData(webtoon.urlOfMobile, option),
      ),
    );
  }

  async scrapeNaverWebtoonAdditionalData(
    url: string,
    option?: {
      type?: string;
      cookie?: string;
    },
  ): Promise<WebtoonAdditionalInfo> {
    // url에 대해 axios.get 요청
    const htmlData = await this.getHtmlData(url, option.cookie);
    const $ = this.loadHtml(htmlData);
    const contentId = extractContentId(url);
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
    const ageLimitText = $(
      '#ct > div.section_toon_info > div.info_back > dl > div.week_day > dd > ul.property.list_detail.age > li',
    ).text();
    const ageLimit = getAgeLimit(ageLimitText);
    const pageCount = $('#ct > div.paging_type2 > em > span').text();

    // 회차 정보 수집
    // page가 없는 경우 예외 처리 필요
    const pages = Array.from(
      { length: !!pageCount ? parseInt(pageCount) + 1 : 1 },
      (v, i) => i + 1,
    );

    const episodesOfAllPages =
      pages.length > 0
        ? await Promise.all(
            pages.map(async (page) => {
              return (async () => {
                const episodesOfPage: Array<WebtoonEpisodeInfo> = [];
                const htmlData = await this.getHtmlData(
                  `${url}&page=${page}`,
                  option.cookie,
                );
                const $ = this.loadHtml(htmlData);

                const episodeItemList = $(
                  '#ct > ul.section_episode_list li.item',
                );
                for (const episodeItem of episodeItemList) {
                  const episodeInfo = this.getWebtoonEpisode($, episodeItem);
                  episodesOfPage.push(episodeInfo);
                }
                return episodesOfPage;
              })();
            }),
          )
        : [];
    const episodes = episodesOfAllPages.reduce(
      (acc, curr) => [...acc, ...curr],
      [],
    );

    return {
      contentId: parseInt(contentId) ?? 0,
      ageLimit,
      summary,
      description,
      genres: [mainGenre, subGenre],
      episodes,
    };
  }

  async getHtmlData(url: string, cookie?: string): Promise<string> {
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
          Cookie: cookie,
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
      .split(' / ')
      .map((authorName) => ({
        name: authorName,
        type: WebtoonAuthorType.COMMON,
      }));
    const badgeAreaText = webtoonElem.find('span.area_badge').text();
    const isNewWebtoon = badgeAreaText.includes('신작');
    const isAdultWebtoon = badgeAreaText.includes('청유물');

    const titleBoxText = webtoonElem.find('div.title_box').text();
    const isPausedWebtoon = titleBoxText.includes('휴재');
    const isUpdatedWebtoon = titleBoxText.includes('업데이트');
    return {
      id: parseInt(contentId) ?? 0,
      type: 0,
      title,
      authors,
      urlOfPc: `https://comic.naver.com${contentUrl}&sortOrder=ASC`,
      urlOfMobile: `https://m.comic.naver.com${contentUrl}&sortOrder=ASC`,
      thumbnailPath,
      platform: Platforms.naver,
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
    const title = $(element).find('div.info .name strong').text().trim();
    const additionalUrl = $(element).find('a').attr('href');
    const thumbnailUrl = $(element).find('div.thumbnail img').attr('src');
    const createDate = $(element)
      .find('div.info div.detail .date')
      .text()
      .trim();
    const isFree =
      $(element).find('div.thumbnail > span > span').text().trim() !==
      '유료만화';
    const isUpdated = !!$(element)
      .find('div.info > strong > span.bullet.up')
      .data();
    return {
      title,
      urlOfPc: `${this.NAVER_WEBTOON_PC_BASE_URL}${additionalUrl}`,
      urlOfMobile: `${this.NAVER_WEBTOON_BASE_URL}${additionalUrl}`,
      thumbnailUrl,
      createDate,
      isFree,
      isUpdated,
    };
  }

  async scrapeKakaoWebtoonSimpleData(
    url: string,
    updateDay: UpdateDayCode,
  ): Promise<WebtoonSimpleInfo[]> {
    const result = await axios.get(url);
    const data = result.data.data;

    if (updateDay === UpdateDays.finished) {
      const contents = data[0]['cardGroups'][0]['cards'];
      return this.getKakaoWebtoonsSimpleInfo(contents, updateDay);
    } else {
      for (const section of data.sections) {
        // 요일 별 데이터 처리
        if (updateDay === UpdateWeekDaysKor[section.title]) {
          const contents = section.cardGroups[0]['cards'];
          return this.getKakaoWebtoonsSimpleInfo(contents, updateDay);
        }
      }
    }
  }

  getKakaoWebtoonsSimpleInfo(
    contents: any,
    updateDay: UpdateDayCode,
  ): WebtoonSimpleInfo[] {
    const webtoonsSimpleInfo = [];
    for (const { content, additional } of contents) {
      const id = content.id;
      const type = getContentType(Contents.webtoon);
      const ageLimit = content.ageLimit;
      const title = content.title;
      const summary = content.catchphraseTwoLines;
      const description = content.synopsis;
      const authors = content.authors;
      const tags = content.seoKeywords.map((seoKeyword) => seoKeyword.slice(1));
      const thumbnailPath = `${content.featuredCharacterImageA}.webp`;
      const thumbnailBackgroundPath = `${content.backgroundImage}.webp`;
      const platform = Platforms.kakao;
      const startedAt = content.serialStartDateTime;
      const isNew = additional.new;
      const isUpdated = additional.up;
      const isAdult = additional.adult;
      const isPaused = additional.rest;
      const url = `${KAKAO_WEBTOON_BASE_URL}/${title}/${id}`;

      webtoonsSimpleInfo.push({
        id,
        type,
        ageLimit,
        title,
        summary,
        description,
        authors: authors.map((author) => ({
          name: author.name,
          type: WebtoonAuthorType[author.type],
        })),
        urlOfPc: url,
        urlOfMobile: url,
        thumbnailPath,
        thumbnailBackgroundPath,
        platform,
        updateDays: [updateDay],
        additional: {
          isNew,
          isAdult,
          isPaused,
          isUpdated,
        },
        tags,
        startedAt,
      });
    }
    return webtoonsSimpleInfo;
  }

  async scrapeKakaoWebtoonsAdditionalData(webtoons: any, axiosConfig: any) {
    return await Promise.all(
      webtoons.map((webtoon) =>
        this.scrapeKakaoWebtoonAdditionalData(
          `${KAKAO_WEBTOON_DETAIL_API_BASE_URL}/${webtoon.id}`,
          axiosConfig,
        ),
      ),
    ).catch((err) => {
      console.error(err);
      throw new InternalServerErrorException();
    });
  }

  async scrapeKakaoWebtoonAdditionalData(
    url: string,
    axiosConfig: any,
  ): Promise<WebtoonAdditionalInfo> {
    const result = await axios.get(url);
    const data = result.data.data;
    const contentId = data.id;
    const main = data.genre;

    const episodes = await this.getKakaoWebtoonEpisodes(contentId, axiosConfig);
    return {
      contentId,
      genres: [main],
      episodes,
    };
  }

  async getKakaoWebtoonEpisodes(
    contentId: number,
    axiosConfig: any,
  ): Promise<WebtoonEpisodeInfo[]> {
    const episodes = [];
    let isLast = false;
    let limit = 100;
    let page = 1;
    while (!isLast) {
      const episodeUrl = this.getKakaoWebtoonEpisodeUrl(contentId, {
        offset: limit * (page - 1),
        limit,
      });
      const episodeResult = await axios.get(episodeUrl, axiosConfig);
      const episodesInfo = episodeResult.data.data.episodes;
      for (const episodeInfo of episodesInfo) {
        const order = episodeInfo.no;
        const title = episodeInfo.title;
        const isFree = episodeInfo.useType === 'FREE' ? true : false;
        const thumbnailUrl = `${episodeInfo.asset.thumbnailImage}.webp`;
        const createDate = episodeInfo.serialStartDateTime;
        const url = `${KAKAO_WEBTOON_EPISODE_BASE_URL}/${episodeInfo.seoId}/${episodeInfo.id}`;
        episodes.push({
          order,
          title,
          thumbnailUrl,
          urlOfPc: url,
          urlOfMobile: url,
          isFree,
          createDate,
        });
      }
      const paginationInfo = episodeResult.data.meta.pagination;
      isLast = paginationInfo.last;
      page++;
    }
    return episodes;
  }
}
