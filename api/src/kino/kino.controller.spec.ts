import { Test, TestingModule } from '@nestjs/testing';
import { KinoController } from './kino.controller';
import { KinoService } from './kino.service';

describe('KinoController', () => {
  let controller: KinoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KinoController],
      providers: [KinoService],
    }).compile();

    controller = module.get<KinoController>(KinoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should analyze combinations with real delays', async () => {
    // Set a higher timeout for this specific test because real sleeps take time
    // 30 seconds should be plenty for a single day fetch
    jest.setTimeout(30000);

    const result = await controller.combinationStats('2025-12-24');
    console.log(result);
    expect(result).toBeDefined();
  }, 30000); // Pass timeout as the 3rd argument
});
