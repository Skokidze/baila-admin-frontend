import React, { useState } from 'react';
import { createPortal } from 'react-dom';

export default function EditLessonModal({ initialData, students, onClose, onSave, userRole }) {
  // Локальное состояние формы, чтобы не перерендеривать App.jsx при каждом нажатии клавиши
  const [formData, setFormData] = useState(initialData);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-sm max-h-[90vh] flex flex-col shadow-2xl overflow-hidden" 
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-white p-4 border-b border-gray-100 flex justify-between items-center shrink-0">
          <h3 className="font-bold text-lg text-gray-900">Редактировать урок</h3>
          <button 
            type="button"
            onClick={onClose} 
            className="text-gray-400 hover:text-black p-1 bg-gray-50 rounded-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div className="overflow-y-auto p-5 bg-[#fafafa]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Дата</label>
              <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-3 text-sm outline-none focus:border-black appearance-none"/>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Длительность</label>
              <select value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-3 text-sm outline-none focus:border-black appearance-none">
                <option value="25">25 мин</option>
                <option value="45">45 мин</option>
                <option value="60">60 мин</option>
                <option value="90">90 мин</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Ученик 1</label>
              <div className="space-y-2">
                <select 
                  required 
                  value={formData.student_1} 
                  onChange={e => {
                    const newStudent1 = e.target.value;
                    // Если новый ученик 1 совпадает с учеником 2, очищаем ученика 2
                    if (newStudent1 === formData.student_2) {
                      setFormData({...formData, student_1: newStudent1, student_2: '', is_cash_2: false});
                    } else {
                      setFormData({ ...formData, student_1: newStudent1 });
                    }
                  }} 
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-3 text-sm outline-none focus:border-black appearance-none">
                  <option value="" disabled>Выбрать</option>
                  {students.map(s => <option key={s.id} value={s.full_name}>{s.full_name}</option>)}
                </select>
            {formData.student_1 && userRole === 'admin' && (
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.is_cash_1 || false}
                        onChange={e => setFormData({...formData, is_cash_1: e.target.checked})}
                        className="w-4 h-4 rounded text-black border-gray-300 focus:ring-black"
                      />
                      Оплата наличными
                    </label>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Ученик 2 (Пара)</label>
              <div className="space-y-2">
                <select value={formData.student_2} onChange={e => setFormData({...formData, student_2: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-3 text-sm outline-none focus:border-black appearance-none">
                  <option value="">Нет (Соло)</option>
                  {students.filter(s => s.full_name !== formData.student_1).map(s => <option key={s.id} value={s.full_name}>{s.full_name}</option>)}
                </select>
            {formData.student_2 && userRole === 'admin' && (
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.is_cash_2 || false}
                        onChange={e => setFormData({...formData, is_cash_2: e.target.checked})}
                        className="w-4 h-4 rounded text-black border-gray-300 focus:ring-black"
                      />
                      Оплата наличными
                    </label>
                )}
              </div>
            </div>

            <div className="pt-4">
              <button type="submit" className="w-full bg-black text-white font-semibold text-base py-3.5 rounded-xl hover:bg-gray-800 transition-colors shadow-lg active:scale-[0.98]">
                Сохранить изменения
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
