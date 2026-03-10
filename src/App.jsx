import React, { useState, useEffect } from 'react';

const BACKEND_URL = 'https://baila-api.onrender.com/api';
//const BACKEND_URL = 'http://localhost:3000/api';


export default function App() {
  const [activeTab, setActiveTab] = useState('students');
  const [studentFilter, setStudentFilter] = useState('debts');
  const [students, setStudents] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Состояния для раскрывающихся списков
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [expandedCoachId, setExpandedCoachId] = useState(null);

  // Вычисляем первый и последний день текущего месяца
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(lastDayOfMonth);

  // Инициализация Telegram
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }
    // Первую загрузку сделает хук снизу, поэтому отсюда fetchData() мы убрали
  }, []);

  // Функция загрузки данных
  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [studentsRes, coachesRes] = await Promise.all([
        fetch(`${BACKEND_URL}/students`),
        fetch(`${BACKEND_URL}/coaches?start=${startDate}&end=${endDate}`)
      ]);
      
      if (!studentsRes.ok || !coachesRes.ok) throw new Error('Ошибка сервера');
      
      setStudents(await studentsRes.json());
      setCoaches(await coachesRes.json());
    } catch (error) {
      console.error('Ошибка:', error);
      setErrorMsg('Не удалось подключиться к бэкенду. Проверьте сервер.');
    } finally {
      setLoading(false);
    }
  };

  // ВОТ ЭТОТ ХУК: Он будет вызывать fetchData() каждый раз, когда меняются даты
  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);


  // Функция оплаты тренеру (НОВАЯ)
  const handleCoachPayout = async (id, name, recommendedAmount) => {
    const amountStr = prompt(`Оформить выплату для: ${name}\nК выплате за период: ${recommendedAmount} ₽\n\nВведите сумму (можно изменить):`, recommendedAmount);
    if (!amountStr) return;
    
    const amount = Number(amountStr);
    if (isNaN(amount) || amount <= 0) return alert('Неверная сумма');

    const dateStr = prompt(`Укажите дату выплаты (ГГГГ-ММ-ДД):\nНапример: 2026-03-10`, new Date().toISOString().split('T')[0]);
    if (!dateStr) return;

    try {
      const response = await fetch(`${BACKEND_URL}/coaches/${id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, date: dateStr })
      });
      if (response.ok) {
        alert('Выплата успешно зафиксирована!');
        fetchData();
      }
    } catch (e) {
      alert('Ошибка при сохранении');
    }
  };


  // Функция пополнения баланса ученика (СТАРАЯ)
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
            <h1 className="text-3xl font-bold mb-4 tracking-tight">Ученики</h1>
            
            {/* ФИЛЬТРЫ: ДОЛГИ / БАЛАНСЫ */}
            <div className="flex gap-2 mb-6">
              <button 
                onClick={() => setStudentFilter('debts')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  studentFilter === 'debts' 
                  ? 'bg-red-50 text-red-600 border border-red-100' 
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Должники
              </button>
              <button 
                onClick={() => setStudentFilter('balances')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  studentFilter === 'balances' 
                  ? 'bg-green-50 text-green-700 border border-green-100' 
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                С балансом
              </button>
            </div>

            {/* СПИСОК УЧЕНИКОВ С ФИЛЬТРАЦИЕЙ */}
            <div className="space-y-4">
              {students
                .filter(student => {
                  // Логика фильтрации
                  if (studentFilter === 'debts') return Number(student.unpaid_debt) > 0;
                  if (studentFilter === 'balances') return Number(student.balance) > 0;
                  return false;
                })
                .map(student => (
                <div key={student.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
                  
                  {/* Основная часть карточки */}
                  <div className="p-5">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-lg text-gray-900">{student.full_name}</h3>
                      {studentFilter === 'balances' && (
                        <p className="font-medium text-lg tracking-tight text-green-600">+{student.balance} ₽</p>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      {Number(student.unpaid_debt) > 0 ? (
                        <button 
                          onClick={() => setExpandedStudentId(expandedStudentId === student.id ? null : student.id)}
                          className="inline-flex items-center px-2.5 py-1 rounded bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2 animate-pulse"></span>
                          Долг: {student.unpaid_debt} ₽
                          <svg className={`w-3 h-3 ml-1 transform transition-transform ${expandedStudentId === student.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>
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

                  {/* Раскрывающийся список уроков */}
                  {expandedStudentId === student.id && student.debt_details && student.debt_details.length > 0 && (
                    <div className="bg-gray-50 border-t border-gray-100 p-4 animate-fade-in">
                      <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Неоплаченные занятия:</p>
                      <div className="space-y-2">
                        {student.debt_details.map((lesson, index) => (
                          <div key={index} className="flex justify-between items-center text-sm bg-white p-2 rounded border border-gray-100">
                            <div>
                              <p className="font-medium text-gray-800">
                                {new Date(lesson.lesson_date).toLocaleDateString('ru-RU')}
                              </p>
                              <p className="text-xs text-gray-500">Тренер: {lesson.trainer_name}</p>
                            </div>
                            <span className="font-bold text-gray-700">{lesson.debt_amount} ₽</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              ))}
              
              {/* Сообщение, если список пуст */}
              {students.filter(s => studentFilter === 'debts' ? Number(s.unpaid_debt) > 0 : Number(s.balance) > 0).length === 0 && (
                <div className="text-center py-10 bg-white border border-dashed border-gray-200 rounded-xl">
                  <p className="text-gray-500 text-sm">
                    {studentFilter === 'debts' ? 'Нет учеников с долгами' : 'Нет учеников с положительным балансом'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}



        {/* ВКЛАДКА ТРЕНЕРОВ */}
        {activeTab === 'coaches' && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6 tracking-tight">Тренеры</h1>
            
            {/* ФИЛЬТР ДАТ */}
            <div className="flex gap-2 mb-6 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1 font-medium">Период с</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} 
                       className="w-full text-sm outline-none bg-transparent font-medium cursor-pointer"/>
              </div>
              <div className="w-px bg-gray-200"></div>
              <div className="flex-1 pl-2">
                <label className="block text-xs text-gray-500 mb-1 font-medium">по</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} 
                       className="w-full text-sm outline-none bg-transparent font-medium cursor-pointer"/>
              </div>
            </div>

            {coaches.length === 0 ? <p className="text-gray-400 text-sm">В этом периоде нет записей</p> : null}
            
            <div className="space-y-4">
              {coaches.map(coach => (
                <div key={coach.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
                  
                  {/* Основная инфа */}
                  <div className="p-5 cursor-pointer" onClick={() => setExpandedCoachId(expandedCoachId === coach.id ? null : coach.id)}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-lg text-gray-900">{coach.full_name}</h3>
                      <svg className={`w-4 h-4 text-gray-400 transform transition-transform ${expandedCoachId === coach.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                    
                    <div className="flex gap-4 mb-4">
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">Начислено</p>
                        <p className="font-medium text-gray-900">{coach.total_earned} ₽</p>
                      </div>
                      <div className="w-px bg-gray-200"></div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">Выплачено</p>
                        <p className="font-medium text-gray-900">{coach.total_paid} ₽</p>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                      <p className="text-sm font-medium text-gray-500">К выплате</p>
                      <p className={`font-semibold text-lg ${coach.balance_due > 0 ? 'text-black' : 'text-gray-400'}`}>
                        {coach.balance_due} ₽
                      </p>
                    </div>
                  </div>

                  {/* Раскрывающийся список уроков */}
                  {expandedCoachId === coach.id && (
                    <div className="bg-[#fafafa] border-t border-gray-100 p-4 animate-fade-in">
                      
                      {coach.balance_due > 0 && (
                        <div className="mb-5">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleCoachPayout(coach.id, coach.full_name, coach.balance_due); }}
                            className="w-full py-2.5 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm"
                          >
                            Зафиксировать выплату
                          </button>
                        </div>
                      )}

                      {coach.lessons && coach.lessons.length > 0 && (
                        <div className="mb-4">
                          <p className="text-[11px] font-semibold text-gray-400 mb-2 uppercase tracking-widest">Проведенные занятия ({coach.lessons.length})</p>
                          <div className="space-y-2">
                            {coach.lessons.map((lesson, idx) => (
                              <div key={idx} className="flex justify-between items-center text-sm bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm">
                                <div>
                                  <p className="font-medium text-gray-800">{new Date(lesson.date).toLocaleDateString('ru-RU')}</p>
                                  <p className="text-xs text-gray-500 mt-0.5">{lesson.students}</p>
                                </div>
                                <span className="font-semibold text-gray-700">+{lesson.salary} ₽</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {coach.payouts && coach.payouts.length > 0 && (
                        <div>
                          <p className="text-[11px] font-semibold text-gray-400 mb-2 uppercase tracking-widest">История выплат</p>
                          <div className="space-y-2">
                            {coach.payouts.map((payout, idx) => (
                              <div key={idx} className="flex justify-between items-center text-sm bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm">
                                <p className="font-medium text-gray-800">{new Date(payout.date).toLocaleDateString('ru-RU')}</p>
                                <span className="font-semibold text-gray-500">-{payout.amount} ₽</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                    </div>
                  )}

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
