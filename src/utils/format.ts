export const formatCurrency = (value: number): string => {
  return `₹ ${Math.round(value).toLocaleString('en-IN')}`;
};

export const formatCurrencyFull = (value: number): string => {
  return `₹ ${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
