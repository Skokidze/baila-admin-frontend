import { useState, useCallback, useEffect } from 'react';

export function useAppData(backendUrl, schoolId) {
  const [students, setStudents] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(false); // Убираем вечную загрузку до получения school_id
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
    if (!schoolId) return { loadedStudents: [], loadedCoaches: [] }; // Не загружаем, пока не узнаем школу
    setLoading(true);
    setErrorMsg('');
    try {
      const [studentsRes, coachesRes] = await Promise.all([
        fetch(`${backendUrl}/students?start=${startDate}&end=${endDate}`, { headers: { 'x-school-id': String(schoolId) } }),
        fetch(`${backendUrl}/coaches?start=${startDate}&end=${endDate}`, { headers: { 'x-school-id': String(schoolId) } })
      ]);
      
      if (!studentsRes.ok || !coachesRes.ok) {
        const sErr = await studentsRes.text().catch(()=>'');
        const cErr = await coachesRes.text().catch(()=>'');
        throw new Error(`HTTP ${studentsRes.status}/${coachesRes.status}. Ошибка БД: ${sErr.substring(0,80)} ${cErr.substring(0,80)}`);
      }
      
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
  }, [backendUrl, schoolId, startDate, endDate]);

  // АВТОМАТИЧЕСКИ загружаем данные, как только узнали школу или поменяли даты
  useEffect(() => {
    if (schoolId) {
      fetchData();
    }
  }, [fetchData, schoolId]);

  return { students, coaches, loading, errorMsg, startDate, setStartDate, endDate, setEndDate, fetchData };
}