import { Test, TestingModule } from '@nestjs/testing';
import { CarboneService } from './carbone.service';

describe('CarboneService', () => {
  let service: CarboneService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CarboneService],
    }).compile();

    service = module.get<CarboneService>(CarboneService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
