import React, { useState, useEffect } from 'react';

const BACKEND_URL = 'https://baila-api.onrender.com';

export default function App() {
  const [activeTab, setActiveTab] = useState('students');
  const [students, setStudents] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Инициализация через официальный метод Telegram
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand(); // Разворачиваем приложение на весь экран
    }
    
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [studentsRes, coachesRes] = await Promise.all([
        fetch(`${BACKEND_URL}/students`),
        fetch(`${BACKEND_URL}/coaches`)
      ]);
      
      if (!studentsRes.ok || !coachesRes.ok) throw new Error('Ошибка сервера');
      
      setStudents(await studentsRes.json());
      setCoaches(await coachesRes.json());
    } catch (error) {
      console.error('Ошибка:', error);
      setErrorMsg('Не удалось подключиться к бэкенду. Проверьте, запущен ли сервер на порту 3000.');
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = async (id, name) => {
    const amountStr = prompt(`Введите сумму пополнения для: ${name}`);
    const amount = Number(amountStr);
    
    if (amount > 0) {
      try {
        const response = await fetch(`${BACKEND_URL}/students/${id}/topup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount })
        });
        
        if (response.ok) {
          alert('Баланс успешно пополнен!');
          fetchData();
        }
      } catch (error) {
        alert('Ошибка при пополнении');
      }
    }
  };

  // Экран загрузки
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold text-gray-600">Загрузка данных...</div>
      </div>
    );
  }

  // Экран ошибки бэкенда
  if (errorMsg) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-100 p-4 text-center">
        <div className="text-red-500 text-xl font-bold mb-2">Ошибка</div>
        <p className="text-gray-700 mb-4">{errorMsg}</p>
        <button onClick={fetchData} className="bg-blue-500 text-white px-4 py-2 rounded-lg">Попробовать снова</button>
      </div>
    );
  }

  // Основной интерфейс
  return (
    <div className="bg-gray-100 min-h-screen text-gray-900 font-sans pb-20">
      <div className="p-4 max-w-md mx-auto">
        
        {/* ВКЛАДКА УЧЕНИКОВ */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Ученики</h2>
            {students.length === 0 ? <p className="text-gray-500 text-center">Нет учеников</p> : null}
            {students.map(student => (
              <div key={student.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{student.full_name}</h3>
                    <p className="text-sm text-gray-500">Баланс: <span className="font-medium text-black">{student.balance} ₽</span></p>
                  </div>
                  <button 
                    onClick={() => handleTopUp(student.id, student.full_name)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
                  >
                    + Пополнить
                  </button>
                </div>
                {Number(student.unpaid_debt) > 0 && (
                  <div className="bg-red-50 text-red-700 p-2 rounded-lg text-sm">
                    Долг за уроки: <span className="font-bold">-{student.unpaid_debt} ₽</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ВКЛАДКА ТРЕНЕРОВ */}
        {activeTab === 'coaches' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Зарплаты тренеров</h2>
            {coaches.length === 0 ? <p className="text-gray-500 text-center">Нет тренеров</p> : null}
            {coaches.map(coach => (
              <div key={coach.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-semibold text-lg mb-2">{coach.full_name}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-500 text-xs">Всего начислено</p>
                    <p className="font-medium">{coach.total_earned} ₽</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-500 text-xs">Уже выплачено</p>
                    <p className="font-medium">{coach.total_paid} ₽</p>
                  </div>
                </div>
                <div className="border-t pt-3 mt-2">
                  <p className="text-sm text-gray-500">К выплате:</p>
                  <p className={`font-bold text-lg ${coach.balance_due > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                    {coach.balance_due} ₽
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* НАВИГАЦИЯ */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button 
          className={`flex flex-col items-center ${activeTab === 'students' ? 'text-blue-600' : 'text-gray-400'}`}
          onClick={() => setActiveTab('students')}
        >
          <span className="text-2xl">👥</span>
          <span className="text-xs font-medium mt-1">Ученики</span>
        </button>
        <button 
          className={`flex flex-col items-center ${activeTab === 'coaches' ? 'text-blue-600' : 'text-gray-400'}`}
          onClick={() => setActiveTab('coaches')}
        >
          <span className="text-2xl">💪</span>
          <span className="text-xs font-medium mt-1">Тренеры</span>
        </button>
      </div>
    </div>
  );
}
