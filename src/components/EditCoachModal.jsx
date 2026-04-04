import React, { useState } from 'react';
import { createPortal } from 'react-dom';

export default function EditCoachModal({ coach, onClose, onSave, onFire }) {
  const [fullName, setFullName] = useState(coach.full_name);
  const [telegramId, setTelegramId] = useState(coach.telegram_id || '');
  const [role, setRole] = useState(coach.role || 'trainer');
  const [isTrainer, setIsTrainer] = useState(coach.is_trainer !== false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (fullName.trim()) {
      onSave(coach.id, fullName.trim(), telegramId ? Number(telegramId) : null, role, isTrainer);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-white p-4 border-b border-gray-100 flex justify-between items-center shrink-0">
          <h3 className="font-bold text-lg text-gray-900 truncate pr-4">Настройки сотрудника</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-black p-1 bg-gray-50 rounded-full shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div className="p-5 bg-[#fafafa] space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Имя и Фамилия</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Telegram ID</label>
              <input
                type="number"
                value={telegramId}
                onChange={e => setTelegramId(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black"
                placeholder="Не привязан"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Статус (права доступа)</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="radio" name="role" value="trainer" checked={role === 'trainer'} onChange={() => setRole('trainer')} className="w-4 h-4 text-black border-gray-300 focus:ring-black" />
                  Обычный Тренер
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="radio" name="role" value="manager" checked={role === 'manager'} onChange={() => setRole('manager')} className="w-4 h-4 text-black border-gray-300 focus:ring-black" />
                  Менеджер (Просмотр отчетов)
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="radio" name="role" value="admin" checked={role === 'admin'} onChange={() => setRole('admin')} className="w-4 h-4 text-black border-gray-300 focus:ring-black" />
                  Администратор (Полный доступ)
                </label>
              </div>
            </div>
          
          <div className="pt-2 border-t border-gray-100">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={isTrainer} onChange={(e) => setIsTrainer(e.target.checked)} className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black" />
              Проводит уроки (показывать в списках тренеров)
            </label>
          </div>
            
            <div className="pt-2">
              <button type="submit" className="w-full bg-black text-white font-semibold text-base py-3.5 rounded-xl hover:bg-gray-800 transition-colors shadow-sm active:scale-[0.98]">
                Сохранить изменения
              </button>
            </div>
          </form>

          <div className="pt-4 border-t border-gray-200">
            <button 
              type="button"
              onClick={() => onFire(coach.id, coach.full_name)} 
              className="w-full bg-red-50 text-red-600 font-semibold text-base py-3.5 rounded-xl hover:bg-red-100 transition-colors shadow-sm active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Уволить сотрудника
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}