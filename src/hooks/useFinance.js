import { useState, useEffect, useCallback } from 'react';

export function useFinance(backendUrl, startDate, endDate) {
  const [financeData, setFinanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFinance = useCallback(async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${backendUrl}/finance?start=${startDate}&end=${endDate}`);
      if (!res.ok) throw new Error('Ошибка при загрузке финансов');
      const data = await res.json();
      setFinanceData(data);
    } catch (err) {
      console.error(err);
      setError('Не удалось загрузить финансовые данные');
    } finally {
      setLoading(false);
    }
  }, [backendUrl, startDate, endDate]);

  useEffect(() => {
    fetchFinance();
  }, [fetchFinance]);

  return { financeData, loading, error, fetchFinance };
}