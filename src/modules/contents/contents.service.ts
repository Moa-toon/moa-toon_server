import { Injectable } from '@nestjs/common';

@Injectable()
export class ContentsService {
  constructor() {}

  getGenres() {
    console.log('getGenres 메서드 호출!!!');
  }
}
