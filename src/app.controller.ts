import { Controller, Get } from '@nestjs/common';
import axios from 'axios';
import { AppService } from './app.service';
import { setRes } from './common/utils/setRes';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    const result = this.appService.getHello();
    return setRes(200, result);
  }

  @Get('/image')
  async getImage() {
    try {
      const axiosConfig = {
        port: null, // port: 80
        headers: {
          // authority: 'm.comic.naver.com',
          // scheme: 'https',
          // accept:
          //   'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
          // 'accept-encoding': 'gzip, deflate, br',
          // 'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
          // 'cache-control': 'no-cache',
          // 'sec-fetch-dest': 'document',
          // 'sec-fetch-mode': 'navigate',
          // 'sec-fetch-site': 'same-origin',
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
          connection: 'keep-alive',
        },
      };
      const data = await axios.get(
        'https://image-comic.pstatic.net/webtoon/796867/thumbnail/thumbnail_IMAG21_77aa5064-b42b-4838-912e-2c6266c53a74.jpg',
        axiosConfig,
      );
      // const data = await axios.get(
      //   'https://image-comic.pstatic.net/webtoon/796867/thumbnail/thumbnail_IMAG21_77aa5064-b42b-4838-912e-2c6266c53a74.jpg',
      // );

      console.log('data?');
      console.log(data.data);
      return setRes(200, true);
    } catch (err) {
      console.log('에러 발생?');
      console.error(err);
      return setRes(500);
    }
  }
}
