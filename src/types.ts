export interface QuoteItem {
  quote_id: string;
  pr_no: string;
  item_code: string;
  item_name: string;
  supplier: string;
  unit: string;
  qty: number;
  unit_price: number | null;
  currency: string;
  quote_date: string;
  required_date: string;
  promised_date: string | null;
  status: '견적' | '발주';
  remark?: string;
}

export type DeliveryState = '지연' | '임박' | '정상' | '납기 미기재' | '판정 대상 아님';
export type PriceState = '이상치' | '정상' | '비교 불가' | '단가 미기재';

export interface CalculatedQuoteItem extends QuoteItem {
  medianPrice: number | null;
  priceDeviation: number | null;
  priceState: PriceState;
  isLowestPrice: boolean;
  dDays: number | null;
  dDayText: string;
  deliveryState: DeliveryState;
  isRequiredExceeded: boolean;
  isNameDiscrepant: boolean;
  discrepantNames?: string[];
  isOrderMismatchLowest?: boolean;
}

export type FilterState = {
  search: string;
  status: '전체' | '견적' | '발주';
  deliveryState: '전체' | '지연' | '임박' | '정상' | '납기 미기재';
  priceState: '전체' | '이상치' | '정상';
  discrepancyOnly: boolean;
  missingOnly: boolean;
  selectedPr: string | null;
};
