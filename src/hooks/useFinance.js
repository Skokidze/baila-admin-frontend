import { useState, useEffect, useCallback } from 'react';

export function useFinance(backendUrl, schoolId, startDate, endDate) {
  const [financeData, setFinanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFinance = useCallback(async () => {
    if (!startDate || !endDate || !schoolId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${backendUrl}/finance?start=${startDate}&end=${endDate}`, { headers: { 'x-school-id': String(schoolId) } });
      if (!res.ok) throw new Error('Ошибка при загрузке финансов');
      const data = await res.json();
      setFinanceData(data);
    } catch (err) {
      console.error(err);
      setError('Не удалось загрузить финансовые данные');
    } finally {
      setLoading(false);
    }
  }, [backendUrl, schoolId, startDate, endDate]);

  useEffect(() => {
    fetchFinance();
  }, [fetchFinance]);

  return { financeData, loading, error, fetchFinance };
}