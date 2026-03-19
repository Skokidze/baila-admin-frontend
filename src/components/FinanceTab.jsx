import React from 'react';
import { useFinance } from '../hooks/useFinance';

export default function FinanceTab({ BACKEND_URL, startDate, setStartDate, endDate, setEndDate }) {
  const { financeData, loading, error } = useFinance(BACKEND_URL, startDate, endDate);

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-4 tracking-tight">Финансы</h1>
      
      {/* Фильтр дат */}
      <div className="flex gap-2 mb-6 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1 font-medium">Период с</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full text-sm outline-none bg-transparent font-medium cursor-pointer" />
        </div>
        <div className="w-px bg-gray-200"></div>
        <div className="flex-1 pl-2">
          <label className="block text-xs text-gray-500 mb-1 font-medium">по</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full text-sm outline-none bg-transparent font-medium cursor-pointer" />
        </div>
      </div>

      {/* Метрики */}
      {loading ? (
        <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div></div>
      ) : error ? (
        <div className="text-center py-10 text-red-500 text-sm">{error}</div>
      ) : financeData ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
            <p className="text-[11px] text-gray-500 font-semibold uppercase mb-1">Выручка (Оборот)</p>
            <p className="text-2xl font-bold text-gray-900">{Number(financeData.total_revenue).toLocaleString('ru-RU')} ₽</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
            <p className="text-[11px] text-gray-500 font-semibold uppercase mb-1">Комиссия (Прибыль)</p>
            <p className="text-2xl font-bold text-green-600">{Number(financeData.total_commission).toLocaleString('ru-RU')} ₽</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
            <p className="text-[11px] text-gray-500 font-semibold uppercase mb-1">Зарплаты тренерам</p>
            <p className="text-xl font-bold text-gray-700">{Number(financeData.total_salary).toLocaleString('ru-RU')} ₽</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
            <p className="text-[11px] text-gray-500 font-semibold uppercase mb-1">Клубный взнос</p>
            <p className="text-xl font-bold text-gray-700">{Number(financeData.total_club_income).toLocaleString('ru-RU')} ₽</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}