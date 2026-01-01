import {Injectable} from '@nestjs/common';
import moment, {type Moment} from 'moment';
import axios from "axios";
import {DateData, KinoDraw, NumberStats} from "../types/kino/dateData";
@Injectable()
export class KinoService {
    async fetchDataForDay(day: Moment): Promise<DateData> {
        const dateString = day.format('YYYY-MM-DD');
        // 1100 is kino's game id in opap api
        const response = await axios.get(`https://api.opap.gr/draws/v3.0/1100/draw-date/${dateString}/${dateString}`);
        console.log(response.data);
        return response.data;
    }

    async fetchDateData(from: Moment, to: Moment): Promise<KinoDraw[]> {
        const days: Moment[] = [];

        let current = from.clone().startOf('day');
        const end = to.clone().startOf('day');
        while (current.isSameOrBefore(end, 'day')) {
            days.push(current.clone());
            current.add(1, 'day');
        }
        const requests = days.map(async day => this.fetchDataForDay(day));
        const results = await Promise.all(requests);
        return Array.prototype.concat(...results.map(data => data.content))
    }

    calculateNumberStats(draws: KinoDraw[]): NumberStats {
        const stats: NumberStats = {};

        for (const draw of draws) {
            // normal numbers
            for (const num of draw.winningNumbers.list) {
                if (!stats[num]) {
                    stats[num] = { occurrences: 0, bonusOccurrences: 0 };
                }
                stats[num].occurrences++;
            }

            // bonus numbers (if exist)
            if (draw.winningNumbers.bonus) {
                for (const bonus of draw.winningNumbers.bonus) {
                    if (!stats[bonus]) {
                        stats[bonus] = { occurrences: 0, bonusOccurrences: 0 };
                    }
                    stats[bonus].bonusOccurrences++;
                }
            }
        }

        return stats;
    }

    async numberStats(from: Moment, to?: Moment) {
        if (!to) to = from.clone();
        const data = await this.fetchDateData(from, to ?? from);
        return this.calculateNumberStats(data);
    }
}
