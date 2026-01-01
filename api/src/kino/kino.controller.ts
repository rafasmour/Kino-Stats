import { Body, Controller, Post } from '@nestjs/common';
import { KinoService } from './kino.service';
import moment, { Moment } from 'moment';

@Controller('kino')
export class KinoController {

    constructor(private readonly kinoService: KinoService) {}

    /**
     * from and to dates in the format of dd/mm/yyyy
     */
    @Post('number-stats')
    async numberStats(
        @Body('from') from: string,
        @Body('to') to?: string,
    ) {
        return this.kinoService.numberStats(
            moment(from, 'DD/MM/YYYY' ),
            moment(to ?? from, 'DD/MM/YYYY')
        );
    }
}