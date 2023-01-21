import { Injectable } from '@nestjs/common';

@Injectable()
export class ScrapeContentService {
  async getContentsByPlatform(platform: string) {
    console.log(platform);
    return platform;
  }
}
