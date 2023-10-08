import { Test, TestingModule } from '@nestjs/testing';
import { ImgService } from './img.service';

describe('ImgService', () => {
  let service: ImgService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImgService],
    }).compile();

    service = module.get<ImgService>(ImgService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
