import {Injectable} from '@nestjs/common';
import moment, {type Moment} from 'moment';
import axios from "axios";
import {DateData, KinoDraw, NumberStats} from "../types/kino/dateData";
import TaskExporter from "../lib/excel-exporter";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
@Injectable()
export class KinoService {
    async fetchDataForDay(day: Moment): Promise<{ content: KinoDraw[] }> {
        const dateString = day.format('YYYY-MM-DD');
        const baseUrl = `https://api.opap.gr/draws/v3.0/1100/draw-date/${dateString}/${dateString}`;
        console.log(baseUrl);
        let allContent: KinoDraw[] = [];
        let currentPage = 0;
        let isLastPage = false;

        while (!isLastPage) {
            try {
                const response = await axios.get(baseUrl, {
                    params: { page: currentPage, size: 100 },
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    }
                });

                allContent.push(...response.data.content);
                isLastPage = response.data.last;
                currentPage++;
                await sleep(100);

            } catch (error: any) {
                // throws 403 on concurrent requests
                if (error.response && error.response.status === 403) {
                    console.warn(`Rate limited on page ${currentPage}. Waiting 5 seconds...`);
                    await sleep(300); // Wait longer if hit by 429
                    continue; // Retry the same page
                }
                throw error; // Re-throw other errors (404, 500, etc)
            }
        }

        return { content: allContent };
    }

    async fetchDateData(from: Moment, to: Moment): Promise<KinoDraw[]> {
        const days: Moment[] = [];
        let current = from.clone().startOf('day');
        const end = to.clone().startOf('day');

        while (current.isSameOrBefore(end, 'day')) {
            days.push(current.clone());
            current.add(1, 'day');
        }

        const allDraws: KinoDraw[] = [];

        for (const day of days) {
            console.log(`Fetching data for: ${day.format('YYYY-MM-DD')}...`);

            const dayData = await this.fetchDataForDay(day);
            allDraws.push(...dayData.content);

            // Optional: Add a small buffer between days to be extra safe
            await sleep(1000);
        }

        return allDraws;
    }

    calculateNumberStats(draws: KinoDraw[]): NumberStats {
        const stats: NumberStats = {};

        for (const draw of draws) {
            // normal numbers
            for (const num of draw.winningNumbers.list) {
                if (!stats[num]) {
                    stats[num] = { number: num, occurrences: 0, bonusOccurrences: 0 };
                }
                stats[num].occurrences++;
            }

            // bonus numbers (if exist)
            if (draw.winningNumbers.bonus) {
                for (const bonus of draw.winningNumbers.bonus) {
                    if (!stats[bonus]) {
                        stats[bonus] = { number: bonus, occurrences: 0, bonusOccurrences: 0 };
                    }
                    stats[bonus].bonusOccurrences++;
                }
            }
        }

        return stats;
    }

    async numberStats(from: Moment, to?: Moment): Promise<NumberStats> {
        if (!to) to = from.clone();
        const data = await this.fetchDateData(from, to ?? from);
        // export data for personal use

        const stats = this.calculateNumberStats(data);
        TaskExporter.excelExport([`${from.format('dd-mm-yyyy')} - ${to.format('dd-mm-yyyy')}`], [Object.values(stats)])
        return stats;
    }
}
