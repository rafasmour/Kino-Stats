import { Body, Controller, HttpException, Post } from '@nestjs/common';
import { KinoService } from './kino.service';
import moment from 'moment';

@Controller('api/kino')
export class KinoController {
  constructor(private readonly kinoService: KinoService) {}

  /**
   * from and to dates in the format of dd/mm/yyyy
   */
  @Post('number-stats')
  async numberStats(@Body('from') from: string, @Body('to') to?: string) {
    if (moment(from, 'DD/MM/YYYY').isAfter(to)) {
      throw new HttpException('to parameter needs to be after from', 400);
    }
    return this.kinoService.numberStats(
      moment(from, 'DD/MM/YYYY'),
      moment(to ?? from, 'DD/MM/YYYY'),
    );
  }

  /*
   * @param min and max are optional
   * min should be between 1 and 12
   * max at the same boundaries and greater than min
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
    if (fromMoment.isAfter(toMoment.toString())) {
      throw new HttpException('to parameter needs to be after from', 400);
    }
    return this.kinoService.combinationStats(fromMoment, toMoment, combLength);
  }
}
