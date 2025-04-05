
import React from 'react';
import { ArrowDown, ArrowUp, ArrowRight } from 'lucide-react';

export const useTokenDetails = () => {
  const formatValue = (value: number | null, decimals: number = 2): string => {
    if (value === null) return '-';
    return value.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const getTrendIcon = (current: number | null, previous: number | null) => {
    if (current === null || previous === null) {
      return <ArrowRight size={16} className="trend-neutral" />;
    }
    
    if (current > previous) {
      return <ArrowUp size={16} className="trend-up" />;
    } else if (current < previous) {
      return <ArrowDown size={16} className="trend-down" />;
    } else {
      return <ArrowRight size={16} className="trend-neutral" />;
    }
  };

  const getPercentChange = (current: number | null, previous: number | null) => {
    if (current === null || previous === null || previous === 0) {
      return null;
    }
    
    const change = ((current - previous) / previous) * 100;
    return {
      value: change,
      formatted: change.toFixed(2) + '%',
      isPositive: change > 0,
      isNeutral: change === 0,
    };
  };

  const truncateAddress = (address: string, start: number = 4, end: number = 4) => {
    if (!address) return '';
    if (address.length <= start + end) return address;
    return `${address.substring(0, start)}...${address.substring(address.length - end)}`;
  };

  const formatCurrency = (value: number, currency: string = 'USD', decimals: number = 2) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  };

  const formatNumberCompact = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short'
    }).format(value);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return {
    formatValue,
    getTrendIcon,
    getPercentChange,
    truncateAddress,
    formatCurrency,
    formatNumberCompact,
    formatTimestamp
  };
};
