export const formatCurrency = (value: number): string => {
  if (value >= 1e12) return `₹ ${(value / 1e12).toFixed(1)} L Cr`;
  if (value >= 1e10) return `₹ ${(value / 1e10).toFixed(1)} K Cr`;
  if (value >= 1e7)  return `₹ ${(value / 1e7).toFixed(1)} Cr`;
  if (value >= 1e5)  return `₹ ${(value / 1e5).toFixed(1)} L`;
  if (value >= 1e3)  return `₹ ${(value / 1e3).toFixed(1)} K`;
  return `₹ ${value.toFixed(2)}`;
};

export const formatCurrencyFull = (value: number): string => {
  return `₹ ${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
