import { Test, TestingModule } from '@nestjs/testing';
import { ScrapeContentService } from './scrape-content.service';

describe('ScrapeContentService', () => {
  let service: ScrapeContentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScrapeContentService],
    }).compile();

    service = module.get<ScrapeContentService>(ScrapeContentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
