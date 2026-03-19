import React, { useState } from 'react';
import { createPortal } from 'react-dom';

export default function EditStudentModal({ student, onClose, onArchive, onSetBalance, onTopUp, onUpdateName, onAddAccount }) {
  const [newName, setNewName] = useState(student.full_name);
  const [newAccount, setNewAccount] = useState('');

  const handleArchive = () => {
    onArchive(student.id, student.full_name);
  };

  const handleSetBalance = () => {
    onClose(); // Закрываем окно, чтобы не мешало при вводе в prompt
    onSetBalance(student.id, student.full_name, student.balance);
  };

  const handleTopUp = () => {
    onClose();
    onTopUp(student.id, student.full_name);
  };

  const handleSaveName = async () => {
    if (newName.trim()) {
      if (newName !== student.full_name) {
        await onUpdateName(student.id, newName.trim());
      }
    }
  };

  const handleSaveAccount = async () => {
    if (newAccount.trim()) {
      await onAddAccount(student.id, newAccount.trim());
      setNewAccount(''); // Очищаем поле после успешного добавления
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-white p-4 border-b border-gray-100 flex justify-between items-center shrink-0">
          <h3 className="font-bold text-lg text-gray-900 truncate pr-4">Настройки ученика</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-black p-1 bg-gray-50 rounded-full shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div className="p-5 bg-[#fafafa] space-y-4">
          {/* Блок изменения имени */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Имя ученика</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black"
              />
              {newName !== student.full_name && (
                <button onClick={handleSaveName} className="bg-black text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors">
                  Сохранить
                </button>
              )}
            </div>
          </div>

          {/* Блок добавления счета */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Дополнительный счет</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Номер телефона / карты"
                value={newAccount}
                onChange={e => setNewAccount(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black"
              />
              <button
                onClick={handleSaveAccount}
                disabled={!newAccount.trim()}
                className="bg-gray-100 text-gray-700 disabled:opacity-50 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                Добавить
              </button>
            </div>
          </div>

          {/* Блок управления балансом */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-500">Текущий баланс</span>
              <span className={`text-lg font-bold ${Number(student.balance) > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                {student.balance} ₽
              </span>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSetBalance} className="flex-1 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors">Изменить</button>
              <button onClick={handleTopUp} className="flex-1 py-2 bg-black text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition-colors shadow-sm">Пополнить</button>
            </div>
          </div>
          
          <div className="pt-2 border-t border-gray-200">
            <button 
              onClick={handleArchive} 
              className="w-full bg-red-50 text-red-600 font-semibold text-base py-3.5 rounded-xl hover:bg-red-100 transition-colors shadow-sm active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
              </svg>
              Убрать в архив
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}