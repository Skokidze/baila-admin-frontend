import { useState, useEffect } from 'react';
import { showAlert } from '../utils/telegram';

export function useBatchLessons(BACKEND_URL, schoolId, students, coaches, currentUser, userRole, fetchData) {
  // Определяем тренера по умолчанию (пусто для админа/менеджера, автоподстановка для тренера)
  const getInitialTrainer = () => {
    if (['admin', 'manager'].includes(userRole)) return '';
    return coaches.find(c => Number(c.telegram_id) === Number(currentUser?.id))?.google_name || coaches.find(c => Number(c.telegram_id) === Number(currentUser?.id))?.full_name || '';
  };

  const [batchForm, setBatchForm] = useState({
    trainer: getInitialTrainer(),
    lesson_date: new Date().toISOString().split('T')[0],
    rows: [{ id: Date.now(), student_1: '', student_2: '', duration: '45', location: 'Черемушки', is_cash_1: false, is_cash_2: false, search1Open: false, search2Open: false }]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Синхронизируем имя тренера, когда загрузятся данные с бэкенда
  useEffect(() => {
    const initialTrainer = getInitialTrainer();
    if (initialTrainer && batchForm.trainer !== initialTrainer) {
      setBatchForm(prev => ({ ...prev, trainer: initialTrainer }));
    }
  }, [coaches, currentUser, userRole]);

  const addLessonRow = () => {
    setBatchForm(prev => ({
      ...prev,
      rows: [...prev.rows, { id: Date.now(), student_1: '', student_2: '', duration: '45', location: 'Черемушки', is_cash_1: false, is_cash_2: false, search1Open: false, search2Open: false }]
    }));
  };

  const updateLessonRow = (id, field, value) => {
    setBatchForm(prev => ({
      ...prev,
      rows: prev.rows.map(row => row.id === id ? { ...row, [field]: value } : row)
    }));
  };

  const removeLessonRow = (id) => {
    if (batchForm.rows.length === 1) return;
    setBatchForm(prev => ({ ...prev, rows: prev.rows.filter(row => row.id !== id) }));
  };

  const handleBatchSubmit = async (e, onSuccess) => {
    e.preventDefault();
    if (isSubmitting) return; // Защита от повторного нажатия
    if (!batchForm.trainer) return showAlert('Пожалуйста, выберите тренера');

    const isFilled = batchForm.rows.every(r => r.student_1 && r.duration);
    if (!isFilled) return showAlert('Во всех строках должен быть выбран ученик и длительность');

    const allStudentsValid = batchForm.rows.every(r => {
      const student1Exists = students.some(s => s.full_name === r.student_1);
      const student2Exists = r.student_2 === '' || students.some(s => s.full_name === r.student_2);
      return student1Exists && student2Exists;
    });

    if (!allStudentsValid) {
      return showAlert('Один или несколько учеников не найдены в списке. Выберите ученика из выпадающего меню.');
    }

    // Находим ID учеников для каждой строки перед отправкой на сервер
    const lessonsWithIds = batchForm.rows.map(row => {
      const st1Obj = students.find(s => s.full_name === row.student_1);
      const st2Obj = students.find(s => s.full_name === row.student_2);
      return {
        ...row,
        student_1_id: st1Obj ? st1Obj.id : null,
        student_2_id: st2Obj ? st2Obj.id : null,
        is_cash_1: userRole === 'admin' ? row.is_cash_1 : false,
        is_cash_2: userRole === 'admin' ? row.is_cash_2 : false
      };
    });

    setIsSubmitting(true);

    try {
      const response = await fetch(`${BACKEND_URL}/lessons/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-school-id': String(schoolId) },
        body: JSON.stringify({
          trainer: batchForm.trainer,
          lesson_date: batchForm.lesson_date,
          lessons: lessonsWithIds
        })
      });

      if (response.ok) {
        showAlert('Уроки успешно добавлены!');
        setBatchForm({
          trainer: getInitialTrainer(),
          lesson_date: new Date().toISOString().split('T')[0],
          rows: [{ id: Date.now(), student_1: '', student_2: '', duration: '45', location: 'Черемушки', is_cash_1: false, is_cash_2: false, search1Open: false, search2Open: false }]
        });
        fetchData();
        if (onSuccess) onSuccess();
      } else {
        const err = await response.json();
        showAlert(`Ошибка: ${err.error}`);
      }
    } catch (error) {
      console.error('Ошибка при пакетном добавлении уроков:', error);
      showAlert(`Ошибка при отправке данных на сервер: ${error.message}`);
    } finally {
      setIsSubmitting(false); // Снимаем блокировку в любом случае (успех или ошибка)
    }
  };

  return { batchForm, setBatchForm, addLessonRow, updateLessonRow, removeLessonRow, handleBatchSubmit, isSubmitting };
}