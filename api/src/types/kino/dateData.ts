export type DateData = {
  content: KinoDraw[];
  totalPages: number;
  totalElements: number;
  last: boolean;
  numberOfElements: number;
  sort: SortDetail[];
  first: boolean;
  size: number;
  number: number;
};
export type SortDetail = {
  direction: string;
  property: string;
  ignoreCase: boolean;
  nullHandling: string;
  descending: boolean;
  ascending: boolean;
};
export interface KinoDraw {
  gameId: number;
  drawId: number;
  drawTime: number; // Unix timestamp (ms)
  status: 'results' | 'active' | 'pending';
  drawBreak: number;
  visualDraw: number;
  pricePoints: PricePoints;
  winningNumbers: WinningNumbers;
  prizeCategories: PrizeCategory[];
  wagerStatistics: WagerStatistics;
}

export interface PricePoints {
  amount: number;
}

export interface WinningNumbers {
  list: number[];
  bonus?: number[];
}

export interface PrizeCategory {
  id: number;
  divident: number;
  winners: number;
  distributed: number;
  jackpot: number;
  fixed: number;
  categoryType: number;
  gameType:
    | 'Kino'
    | 'KinoBonus'
    | 'KenoCloseToWin'
    | 'Column'
    | 'Draw'
    | 'OddEven';
}

export interface WagerStatistics {
  columns: number;
  wagers: number;
  addOn?: number[];
}

export type NumberStats = {
  [key: number]: {
    number: number;
    occurrences: number;
    bonusOccurrences: number;
  };
};

export type CombinationStats = {
  [combination: string]: {
    combination: string;
    percentage: number;
  };
};

export type WinningStat = {
  time: string;
  distributed: PrizeCategory['distributed'];
  gameType: PrizeCategory['gameType'];
};
