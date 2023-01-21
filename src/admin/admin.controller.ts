import { Controller, Get, Query } from '@nestjs/common';

@Controller('admin')
export class AdminController {
  @Get('/contents')
  async getContentsByPlatform(@Query('platform') platform: string) {
    return platform;
  }
}
