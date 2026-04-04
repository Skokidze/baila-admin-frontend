import { useState, useCallback } from 'react';

export function useAppData(backendUrl) {
  const [students, setStudents] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const formatDateLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [startDate, setStartDate] = useState(formatDateLocal(firstDay));
  const [endDate, setEndDate] = useState(formatDateLocal(lastDay));

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [studentsRes, coachesRes] = await Promise.all([
        fetch(`${backendUrl}/students?start=${startDate}&end=${endDate}`),
        fetch(`${backendUrl}/coaches?start=${startDate}&end=${endDate}`)
      ]);
      
      if (!studentsRes.ok || !coachesRes.ok) throw new Error('Ошибка сервера');
      
      const loadedStudents = await studentsRes.json();
      const loadedCoaches = await coachesRes.json();
      
      setStudents(loadedStudents);
      setCoaches(loadedCoaches);
      
      return { loadedStudents, loadedCoaches };
    } catch (error) {
      console.error('Ошибка:', error);
    setErrorMsg(`Ошибка загрузки: ${error.message}`);
      return { error };
    } finally {
      setLoading(false);
    }
  }, [backendUrl, startDate, endDate]);

  return { students, coaches, loading, errorMsg, startDate, setStartDate, endDate, setEndDate, fetchData };
}