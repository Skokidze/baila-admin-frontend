import React, { useState } from 'react';

export default function AddCoachModal({ onClose, onSave }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [telegramId, setTelegramId] = useState('');
  const [role, setRole] = useState('trainer');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (firstName.trim() && lastName.trim()) {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const googleName = lastName.trim();
      // Передаем собранные данные
      onSave(fullName, googleName, telegramId.trim() ? Number(telegramId.trim()) : null, role);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Добавить тренера</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              required
              placeholder="Например, Иван"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Фамилия</label>
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              required
              placeholder="Например, Иванов"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telegram ID (Опционально)</label>
            <input
              type="number"
              value={telegramId}
              onChange={e => setTelegramId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Например, 123456789"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Статус (права доступа)</label>
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
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Отмена</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800">Добавить</button>
          </div>
        </form>
      </div>
    </div>
  );
}