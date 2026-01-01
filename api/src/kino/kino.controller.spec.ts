import { Test, TestingModule } from '@nestjs/testing';
import { KinoController } from './kino.controller';

describe('KinoController', () => {
  let controller: KinoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KinoController],
    }).compile();

    controller = module.get<KinoController>(KinoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
