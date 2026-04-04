import React, { useState } from 'react';
import { useFinance } from '../hooks/useFinance';

export default function MainTab({ BACKEND_URL, handlePayAllDebts }) {
  // Локальные стейты для дат вкладки "Финансы" (по умолчанию текущий месяц)
  const [financeStartDate, setFinanceStartDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  });
  
  const [financeEndDate, setFinanceEndDate] = useState(() => {
    const d = new Date();
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;
  });

  const { financeData, loading, error } = useFinance(BACKEND_URL, financeStartDate, financeEndDate);
  const [activeSubTab, setActiveSubTab] = useState('management'); // 'management' или 'finance'

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-4 tracking-tight">Главная</h1>

      {/* Переключатель под-вкладок */}
      <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
        <button onClick={() => setActiveSubTab('management')} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeSubTab === 'management' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>Управление</button>
        <button onClick={() => setActiveSubTab('finance')} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeSubTab === 'finance' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>Финансы</button>
      </div>

      {/* ВКЛАДКА: УПРАВЛЕНИЕ */}
      {activeSubTab === 'management' && (
        <div className="animate-fade-in space-y-3">
          <button 
            onClick={handlePayAllDebts}
            className="w-full bg-white border border-gray-200 text-gray-800 font-semibold text-[14px] py-3.5 px-4 rounded-xl hover:bg-gray-50 transition-colors shadow-sm active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            Обновить балансы
          </button>
        </div>
      )}

      {/* ВКЛАДКА: ФИНАНСЫ (Перенесенный код) */}
      {activeSubTab === 'finance' && (
        <div className="animate-fade-in">
          <div className="flex gap-2 mb-6 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1 font-medium">Период с</label>
              <input type="date" value={financeStartDate} onChange={e => setFinanceStartDate(e.target.value)} className="w-full text-sm outline-none bg-transparent font-medium cursor-pointer" />
            </div>
            <div className="w-px bg-gray-200"></div>
            <div className="flex-1 pl-2">
              <label className="block text-xs text-gray-500 mb-1 font-medium">по</label>
              <input type="date" value={financeEndDate} onChange={e => setFinanceEndDate(e.target.value)} className="w-full text-sm outline-none bg-transparent font-medium cursor-pointer" />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div></div>
          ) : error ? (
            <div className="text-center py-10 text-red-500 text-sm">{error}</div>
          ) : financeData ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center"><p className="text-[11px] text-gray-500 font-semibold uppercase mb-1">Выручка (Оборот)</p><p className="text-2xl font-bold text-gray-900">{Number(financeData.total_revenue).toLocaleString('ru-RU')} ₽</p></div>
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center"><p className="text-[11px] text-gray-500 font-semibold uppercase mb-1">Комиссия (Прибыль)</p><p className="text-2xl font-bold text-green-600">{Number(financeData.total_commission).toLocaleString('ru-RU')} ₽</p></div>
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center"><p className="text-[11px] text-gray-500 font-semibold uppercase mb-1">Зарплаты тренерам</p><p className="text-xl font-bold text-gray-700">{Number(financeData.total_salary).toLocaleString('ru-RU')} ₽</p></div>
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center"><p className="text-[11px] text-gray-500 font-semibold uppercase mb-1">Клубный взнос</p><p className="text-xl font-bold text-gray-700">{Number(financeData.total_club_income).toLocaleString('ru-RU')} ₽</p></div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}