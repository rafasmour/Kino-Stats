import { Injectable } from '@nestjs/common';
import { type Moment } from 'moment';
import axios, { AxiosResponse } from 'axios';
import combination from 'combinations';
import {
  CombinationStats,
  DateData,
  KinoDraw,
  NumberStats,
} from '../types/kino/dateData';
import ExcelExporter from '../lib/excel-exporter';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
@Injectable()
export class KinoService {
  async fetchDataForDay(day: Moment): Promise<{ content: KinoDraw[] }> {
    const dateString = day.format('YYYY-MM-DD');
    const baseUrl = `https://api.opap.gr/draws/v3.0/1100/draw-date/${dateString}/${dateString}`;
    console.log(baseUrl);
    const allContent: KinoDraw[] = [];
    let currentPage = 0;
    let isLastPage = false;

    while (!isLastPage) {
      try {
        const response: AxiosResponse<DateData> = await axios.get(baseUrl, {
          params: { page: currentPage, size: 100 },
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });

        allContent.push(...response.data.content);
        isLastPage = response.data.last;
        currentPage++;
        await sleep(20);
      } catch (error: any) {
        // throws 403 on concurrent requests
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (error?.response && error?.response.status === 403) {
          console.warn(
            `Rate limited on page ${currentPage}. Waiting 5 seconds...`,
          );
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
    const current = from.clone().startOf('day');
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
      await sleep(100);
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
            stats[bonus] = {
              number: bonus,
              occurrences: 0,
              bonusOccurrences: 0,
            };
          }
          stats[bonus].bonusOccurrences++;
        }
      }
    }

    return Object.values(stats).sort((a, b) => a.occurrences - b.occurrences);
  }

  async numberStats(from: Moment, to?: Moment): Promise<NumberStats> {
    if (!to) to = from.clone();
    const data = await this.fetchDateData(from, to ?? from);
    // export data for personal use

    const stats = this.calculateNumberStats(data);
    if (stats) {
      ExcelExporter.excelExport(
        [`${from.format('dd-mm-yyyy')} - ${to.format('dd-mm-yyyy')}`],
        [Object.values(stats)],
      );
    }
    return stats;
  }

  // kino has a max of 1 to 12 numbers to be played
  calculateCombinationStats(
    draws: KinoDraw[],
    combLength: number = 4,
  ): CombinationStats {
    const frequencyMap = new Map<string, number>();
    const totalDraws = draws.length || 1;
    const numberOccurrences = this.calculateNumberStats(draws);

    const topNumbers = Object.values(numberOccurrences)
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 20)
      .map((entry) => Number(entry.number));

    const combinations = combination(topNumbers, combLength, combLength);
    console.log(`The top numbers are ${topNumbers.join(',')}`);
    console.log(`Combinations to check: ${combinations.length}`);
    for (const draw of draws) {
      const winningSet = new Set(draw.winningNumbers.list);

      for (let j = 0; j < combinations.length; j++) {
        const currentComb = combinations[j];

        let hasAll = true;
        for (let k = 0; k < currentComb.length; k++) {
          if (!winningSet.has(currentComb[k])) {
            hasAll = false;
            break;
          }
        }

        if (hasAll) {
          const key = currentComb.sort((a, b) => a - b).join(',');
          frequencyMap.set(key, (frequencyMap.get(key) || 0) + 1);
        }
      }
    }

    const sortedStats = Array.from(frequencyMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 100);

    const finalStats: CombinationStats = {};
    for (const [comb, count] of sortedStats) {
      const percentage = (count / totalDraws) * 100;
      finalStats[comb] = {
        combination: comb,
        percentage: parseFloat(percentage.toFixed(2)),
      };
    }

    return finalStats;
  }
  async combinationStats(
    from: Moment,
    to?: Moment,
    combLength?: number,
  ): Promise<CombinationStats> {
    if (!to) to = from.clone();
    const data = await this.fetchDateData(from, to ?? from);
    const stats = this.calculateCombinationStats(data, combLength);
    if (stats) {
      ExcelExporter.excelExport(['1'], [Object.values(stats)]);
    }
    return stats;
  }
}
