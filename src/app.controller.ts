import { Controller, Get } from '@nestjs/common';
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
}
