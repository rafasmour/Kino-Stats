import { Test, TestingModule } from '@nestjs/testing';
import { KinoService } from './kino.service';

describe('KinoService', () => {
  let service: KinoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KinoService],
    }).compile();

    service = module.get<KinoService>(KinoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
