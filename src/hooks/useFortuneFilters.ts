import { useMemo } from 'react';
import { FortuneHistory } from '@/types';

export interface FortuneFilters {
  filterByText: (fortune: FortuneHistory, query: string) => boolean;
  filterByCard: (fortune: FortuneHistory, cardName: string) => boolean;
  filterByDateRange: (fortune: FortuneHistory, range: { start: string; end: string }) => boolean;
}

export const useFortuneFilters = (): FortuneFilters => {
  const filterByText = useMemo(() => (fortune: FortuneHistory, query: string): boolean => {
    if (!query) return true;
    const lowerQuery = query.toLowerCase();
    return fortune.question.toLowerCase().includes(lowerQuery) ||
           fortune.result.toLowerCase().includes(lowerQuery);
  }, []);

  const filterByCard = useMemo(() => (fortune: FortuneHistory, cardName: string): boolean => {
    if (!cardName) return true;
    return fortune.cards.some(card => card.cardName === cardName);
  }, []);

  const filterByDateRange = useMemo(() => (fortune: FortuneHistory, range: { start: string; end: string }): boolean => {
    if (!range.start && !range.end) return true;
    
    const fortuneDate = fortune.timestamp 
      ? new Date(fortune.timestamp.seconds * 1000)
      : new Date(0);
    
    if (range.start) {
      const startDate = new Date(range.start);
      if (fortuneDate < startDate) return false;
    }
    
    if (range.end) {
      const endDate = new Date(range.end);
      endDate.setHours(23, 59, 59, 999);
      if (fortuneDate > endDate) return false;
    }
    
    return true;
  }, []);

  return {
    filterByText,
    filterByCard,
    filterByDateRange
  };
};