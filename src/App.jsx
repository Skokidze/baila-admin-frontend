import React, { useState, useEffect } from 'react';

const BACKEND_URL = 'https://baila-api.onrender.com/api';

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

  // ... (верхняя часть кода с fetchData остается без изменений) ...

    // Основной интерфейс (стиль Notion)
  return (
    <div className="min-h-screen bg-[#fafafa] text-[#111] font-sans pb-24">
      <div className="max-w-md mx-auto px-5 py-6 space-y-6">
        
        {/* ВКЛАДКА УЧЕНИКОВ */}
        {activeTab === 'students' && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6 tracking-tight">Ученики</h1>
            {students.length === 0 ? <p className="text-gray-400 text-sm">Пусто</p> : null}
            
            <div className="space-y-4">
              {students.map(student => (
                <div key={student.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
                  
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-lg text-gray-900">{student.full_name}</h3>
                    <p className="font-medium text-lg tracking-tight">{student.balance} ₽</p>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    {Number(student.unpaid_debt) > 0 ? (
                      <div className="inline-flex items-center px-2.5 py-1 rounded bg-gray-100 text-gray-700 text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-2"></span>
                        Долг: {student.unpaid_debt} ₽
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400">Всё оплачено</div>
                    )}
                    
                    <button 
                      onClick={() => handleTopUp(student.id, student.full_name)}
                      className="px-4 py-1.5 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    >
                      Пополнить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ВКЛАДКА ТРЕНЕРОВ */}
        {activeTab === 'coaches' && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6 tracking-tight">Тренеры</h1>
            {coaches.length === 0 ? <p className="text-gray-400 text-sm">Пусто</p> : null}
            
            <div className="space-y-4">
              {coaches.map(coach => (
                <div key={coach.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
                  
                  <h3 className="font-semibold text-lg text-gray-900 mb-4">{coach.full_name}</h3>
                  
                  <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Начислено</p>
                      <p className="font-medium">{coach.total_earned} ₽</p>
                    </div>
                    <div className="w-px bg-gray-200"></div> {/* Разделитель */}
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Выплачено</p>
                      <p className="font-medium">{coach.total_paid} ₽</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-3 flex justify-between items-center mt-2">
                    <p className="text-sm text-gray-500">К выплате</p>
                    <p className={`font-semibold text-lg ${coach.balance_due > 0 ? 'text-black' : 'text-gray-400'}`}>
                      {coach.balance_due} ₽
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* НАВИГАЦИЯ (Нижнее меню в стиле Notion) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-xs bg-white border border-gray-200 rounded-full shadow-lg flex justify-between px-2 py-2">
        <button 
          className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors ${activeTab === 'students' ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-gray-800'}`}
          onClick={() => setActiveTab('students')}
        >
          Ученики
        </button>
        <button 
          className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors ${activeTab === 'coaches' ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-gray-800'}`}
          onClick={() => setActiveTab('coaches')}
        >
          Тренеры
        </button>
      </div>
    </div>
  );
}
