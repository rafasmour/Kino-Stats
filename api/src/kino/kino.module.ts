import { Module } from '@nestjs/common';
import { KinoController } from './kino.controller';
import { KinoService } from './kino.service';

@Module({
  controllers: [KinoController],
  providers: [KinoService]
})
export class KinoModule {}
