import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { showAlert } from '../utils/telegram';

export default function TariffsModal({ coaches, onClose, BACKEND_URL, schoolId }) {
  const [selectedCoachId, setSelectedCoachId] = useState('');
  const [tariffs, setTariffs] = useState({
    45: { client_price: '', coach_salary: '' },
    60: { client_price: '', coach_salary: '' },
    90: { client_price: '', coach_salary: '' },
  });
  const [loading, setLoading] = useState(false);

  // При выборе тренера загружаем его тарифы из базы
  useEffect(() => {
    if (!selectedCoachId) {
      setTariffs({
        45: { client_price: '', coach_salary: '' },
        60: { client_price: '', coach_salary: '' },
        90: { client_price: '', coach_salary: '' },
      });
      return;
    }

    const fetchTariffs = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BACKEND_URL}/tariffs/${selectedCoachId}`, {
          headers: { 'x-school-id': String(schoolId) }
        });
        if (res.ok) {
          const data = await res.json();
          const newTariffs = { ...tariffs };
          // Заполняем форму загруженными данными
          data.forEach(t => {
            if (newTariffs[t.duration]) {
              newTariffs[t.duration] = { client_price: t.client_price, coach_salary: t.coach_salary };
            }
          });
          setTariffs(newTariffs);
        }
      } catch (e) {
        console.error('Ошибка загрузки тарифов', e);
      } finally {
        setLoading(false);
      }
    };
    fetchTariffs();
  }, [selectedCoachId, BACKEND_URL, schoolId]);

  const handleSave = async () => {
    if (!selectedCoachId) return showAlert('Выберите тренера');
    
    // Собираем только заполненные тарифы
    const payload = [];
    [45, 60, 90].forEach(duration => {
      if (tariffs[duration].client_price !== '' && tariffs[duration].coach_salary !== '') {
        payload.push({
          duration,
          client_price: Number(tariffs[duration].client_price),
          coach_salary: Number(tariffs[duration].coach_salary)
        });
      }
    });

    try {
      const res = await fetch(`${BACKEND_URL}/tariffs/${selectedCoachId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-school-id': String(schoolId) },
        body: JSON.stringify({ tariffs: payload })
      });
      if (res.ok) {
        showAlert('Тарифы успешно сохранены');
        onClose();
      } else {
        const err = await res.json();
        showAlert(`Ошибка: ${err.error}`);
      }
    } catch (e) {
      showAlert('Ошибка сохранения');
    }
  };

  const handleInputChange = (duration, field, value) => {
    setTariffs(prev => ({ ...prev, [duration]: { ...prev[duration], [field]: value } }));
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm max-h-[90vh] flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-white p-4 border-b border-gray-100 flex justify-between items-center shrink-0">
          <h3 className="font-bold text-lg text-gray-900">Тарифы тренеров</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-black p-1 bg-gray-50 rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div className="p-5 bg-[#fafafa] overflow-y-auto space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Выберите тренера</label>
            <select value={selectedCoachId} onChange={e => setSelectedCoachId(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-3 text-sm outline-none focus:border-black appearance-none">
              <option value="" disabled>-- Выберите --</option>
              {coaches.filter(c => c.is_trainer).map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
          </div>

          {loading && <div className="text-center py-4"><div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto"></div></div>}

          {selectedCoachId && !loading && (
            <div className="space-y-4 animate-fade-in">
              {[45, 60, 90].map(duration => (
                <div key={duration} className="bg-white p-3 border border-gray-200 rounded-xl shadow-sm">
                  <h4 className="font-bold text-sm text-gray-800 mb-2">{duration} минут</h4>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase">Студент платит (₽)</label>
                      <input type="number" value={tariffs[duration].client_price} onChange={e => handleInputChange(duration, 'client_price', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-black" placeholder="0" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase">Зарплата (₽)</label>
                      <input type="number" value={tariffs[duration].coach_salary} onChange={e => handleInputChange(duration, 'coach_salary', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-black" placeholder="0" />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={handleSave} className="w-full bg-black text-white font-semibold text-base py-3.5 rounded-xl hover:bg-gray-800 transition-colors shadow-md mt-4 active:scale-[0.98]">
                Сохранить тарифы
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}