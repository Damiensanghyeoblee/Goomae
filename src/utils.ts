import { QuoteItem, CalculatedQuoteItem, DeliveryState, PriceState } from './types';
import { BASE_DATE } from './data';

export function calculateQuotes(quotes: QuoteItem[]): CalculatedQuoteItem[] {
  // 1. Group by item_code to check name discrepancies
  const itemNameToCodes: Record<string, Set<string>> = {};
  const codeToNames: Record<string, Set<string>> = {};

  quotes.forEach((q) => {
    const code = q.item_code;
    const name = (q.item_name || '').trim();
    if (!code) return;

    if (!codeToNames[code]) {
      codeToNames[code] = new Set();
    }
    codeToNames[code].add(name);
  });

  const discrepantCodes = new Set<string>();
  Object.keys(codeToNames).forEach((code) => {
    if (codeToNames[code].size >= 2) {
      discrepantCodes.add(code);
    }
  });

  // 2. Group by pr_no for median & lowest price calculation
  const prGroups: Record<string, QuoteItem[]> = {};
  quotes.forEach((q) => {
    if (!prGroups[q.pr_no]) {
      prGroups[q.pr_no] = [];
    }
    prGroups[q.pr_no].push(q);
  });

  // Calculate medians and lowest prices per PR
  const prMedians: Record<string, number | null> = {};
  const prLowestPrices: Record<string, number | null> = {};
  const prLowestQuoteIds: Record<string, string> = {};

  Object.keys(prGroups).forEach((prNo) => {
    const group = prGroups[prNo];
    const validPrices = group
      .map((q) => q.unit_price)
      .filter((p): p is number => p !== null && !isNaN(p) && p > 0);

    if (validPrices.length === 0) {
      prMedians[prNo] = null;
      prLowestPrices[prNo] = null;
      return;
    }

    // Median
    const sorted = [...validPrices].sort((a, b) => a - b);
    let median = 0;
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      median = (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
      median = sorted[mid];
    }
    prMedians[prNo] = median;

    // Lowest price candidate pool: exclude outliers or determine after outlier check?
    // PRD 5.3: Candidate set = price_state in {정상, 비교 불가}.
    // Let's first determine price states for the group.
    const nonOutlierPrices: { price: number; quoteId: string; quoteDate: string }[] = [];
    group.forEach((q) => {
      if (q.unit_price === null) return;
      const dev = validPrices.length >= 3 ? ((q.unit_price - median) / median) * 100 : 0;
      const isOutlier = validPrices.length >= 3 && Math.abs(dev) > 30;
      if (!isOutlier) {
        nonOutlierPrices.push({
          price: q.unit_price,
          quoteId: q.quote_id,
          quoteDate: q.quote_date,
        });
      }
    });

    if (nonOutlierPrices.length > 0) {
      nonOutlierPrices.sort((a, b) => {
        if (a.price !== b.price) return a.price - b.price;
        if (a.quoteDate !== b.quoteDate) return a.quoteDate.localeCompare(b.quoteDate);
        return a.quoteId.localeCompare(b.quoteId);
      });
      prLowestPrices[prNo] = nonOutlierPrices[0].price;
      prLowestQuoteIds[prNo] = nonOutlierPrices[0].quoteId;
    } else {
      prLowestPrices[prNo] = null;
    }
  });

  const baseDateObj = new Date(BASE_DATE);

  // 3. Process each quote item
  return quotes.map((q) => {
    const prNo = q.pr_no;
    const group = prGroups[prNo] || [];
    const validPrices = group
      .map((item) => item.unit_price)
      .filter((p): p is number => p !== null && !isNaN(p) && p > 0);

    const median = prMedians[prNo];
    let priceState: PriceState = '정상';
    let priceDeviation: number | null = null;

    if (q.unit_price === null || q.unit_price === undefined) {
      priceState = '단가 미기재';
    } else if (validPrices.length < 3 || median === null) {
      priceState = '비교 불가';
    } else {
      priceDeviation = Number((((q.unit_price - median) / median) * 100).toFixed(1));
      if (Math.abs(priceDeviation) > 30) {
        priceState = '이상치';
      } else {
        priceState = '정상';
      }
    }

    const isLowestPrice =
      q.unit_price !== null &&
      prLowestPrices[prNo] !== null &&
      q.unit_price === prLowestPrices[prNo] &&
      (prLowestQuoteIds[prNo] === q.quote_id ||
        priceState === '정상' ||
        priceState === '비교 불가');

    // Delivery calculation
    let dDays: number | null = null;
    let dDayText = '-';
    let deliveryState: DeliveryState = '판정 대상 아님';
    let isRequiredExceeded = false;

    if (q.status === '발주') {
      if (!q.promised_date) {
        deliveryState = '납기 미기재';
      } else {
        const promisedDateObj = new Date(q.promised_date);
        const diffTime = promisedDateObj.getTime() - baseDateObj.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        dDays = diffDays;

        if (diffDays > 0) {
          dDayText = `D-${diffDays}`;
        } else if (diffDays === 0) {
          dDayText = 'D-DAY';
        } else {
          dDayText = `D+${Math.abs(diffDays)}`;
        }

        if (diffDays < 0) {
          deliveryState = '지연';
        } else if (diffDays >= 0 && diffDays <= 7) {
          deliveryState = '임박';
        } else {
          deliveryState = '정상';
        }
      }
    } else {
      if (q.promised_date) {
        const promisedDateObj = new Date(q.promised_date);
        const diffTime = promisedDateObj.getTime() - baseDateObj.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        dDays = diffDays;
        if (diffDays > 0) dDayText = `D-${diffDays}`;
        else if (diffDays === 0) dDayText = 'D-DAY';
        else dDayText = `D+${Math.abs(diffDays)}`;
      }
      deliveryState = '판정 대상 아님';
    }

    if (q.promised_date && q.required_date) {
      if (q.promised_date > q.required_date) {
        isRequiredExceeded = true;
      }
    }

    const isNameDiscrepant = discrepantCodes.has(q.item_code);
    const discrepantNames = isNameDiscrepant
      ? Array.from(codeToNames[q.item_code] || [])
      : undefined;

    return {
      ...q,
      medianPrice: median,
      priceDeviation,
      priceState,
      isLowestPrice: Boolean(isLowestPrice),
      dDays,
      dDayText,
      deliveryState,
      isRequiredExceeded,
      isNameDiscrepant,
      discrepantNames,
    };
  });
}

export function formatKRW(amount: number | null): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '-';
  return amount.toLocaleString('ko-KR') + '원';
}

export function formatNumber(num: number | null): string {
  if (num === null || num === undefined || isNaN(num)) return '-';
  return num.toLocaleString('ko-KR');
}
