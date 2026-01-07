import { Body, Controller, HttpException, Post } from '@nestjs/common';
import { KinoService } from './kino.service';
import moment from 'moment';

/**
 * from and to dates in the format of dd/mm/yyyy
 */
@Controller('api/kino')
export class KinoController {
  constructor(private readonly kinoService: KinoService) {}

  /*
   * See which hour has the most winning money and share
   * */
  @Post('winning-stats')
  async winningStats(@Body('from') from: string, @Body('to') to: string) {
    const fromMoment = moment(from, 'DD/MM/YYYY');
    const toMoment = moment(to ?? from, 'DD/MM/YYYY');
    if (fromMoment.isAfter(toMoment)) {
      throw new HttpException('to parameter needs to be after from', 400);
    }

    return await this.kinoService.winningStats(fromMoment, toMoment);
  }

  @Post('number-stats')
  async numberStats(@Body('from') from: string, @Body('to') to?: string) {
    const fromMoment = moment(from, 'DD/MM/YYYY');
    const toMoment = moment(to ?? from, 'DD/MM/YYYY');
    if (fromMoment.isAfter(toMoment)) {
      throw new HttpException('to parameter needs to be after from', 400);
    }
    return await this.kinoService.numberStats(fromMoment, toMoment);
  }

  /*
   * @param min and max are optional
   * combLength should be between 1 and 12
   * */
  @Post('combination-stats')
  async combinationStats(
    @Body('from') from: string,
    @Body('to') to?: string,
    @Body('combLength') combLength?: number,
  ) {
    if (!combLength) combLength = 4;
    if (combLength < 1 || combLength > 12)
      throw new HttpException('combLength should be between 1 and 12', 400);
    const fromMoment = moment(from, 'DD/MM/YYYY');
    const toMoment = moment(to ?? from, 'DD/MM/YYYY');
    if (fromMoment.isAfter(toMoment)) {
      throw new HttpException('to parameter needs to be after from', 400);
    }
    return await this.kinoService.combinationStats(
      fromMoment,
      toMoment,
      combLength,
    );
  }
}
