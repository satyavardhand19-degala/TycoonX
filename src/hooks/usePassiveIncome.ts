import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export function usePassiveIncome() {
  const tick = useGameStore(s => s.tick);
  const updateCryptoPrices = useGameStore(s => s.updateCryptoPrices);
  const updateStockPrices = useGameStore(s => s.updateStockPrices);

  useEffect(() => {
    const incomeTimer = setInterval(() => tick(1), 1000);
    const cryptoTimer = setInterval(updateCryptoPrices, 5000);
    const stockTimer  = setInterval(updateStockPrices, 30000);
    return () => {
      clearInterval(incomeTimer);
      clearInterval(cryptoTimer);
      clearInterval(stockTimer);
    };
  }, [tick, updateCryptoPrices, updateStockPrices]);
}
