import React, { useState } from 'react';

export default function CoachTab({
  userRole,
  currentUser,
  coaches,
  students,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  handleCoachPayout,
  handleEditClick,
  handleDeleteLesson,
  batchForm,
  setBatchForm,
  handleBatchSubmit,
  addLessonRow,
  updateLessonRow,
  removeLessonRow,
  setShowAddCoachModal,
  setEditingCoach
}) {
  // Внутренние UI-стейты (перенесены из App.jsx)
  const [coachTab, setCoachTab] = useState('report'); 
  const [selectedCoaches, setSelectedCoaches] = useState([]); 
  const [expandedCoachId, setExpandedCoachId] = useState(null);
  const [trainerSearchOpen, setTrainerSearchOpen] = useState(false);

  const toggleCoachFilter = (coachName) => {
    if (selectedCoaches.includes(coachName)) {
      setSelectedCoaches(selectedCoaches.filter(name => name !== coachName));
    } else {
      setSelectedCoaches([...selectedCoaches, coachName]);
    }
  };

  // Обертка над отправкой, чтобы переключить вкладку в случае успеха
  const onSubmit = (e) => {
    handleBatchSubmit(e, () => setCoachTab('report'));
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-4 tracking-tight">
        {['admin', 'manager'].includes(userRole) 
          ? 'Тренеры' 
          : (coaches.find(c => Number(c.telegram_id) === Number(currentUser?.id))?.full_name || 'Мои уроки')
        }
      </h1>

      <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
        <button onClick={() => setCoachTab('report')} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${coachTab === 'report' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>Отчеты</button>
        <button onClick={() => setCoachTab('add_lesson')} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${coachTab === 'add_lesson' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>+ Добавить урок</button>
        {userRole === 'admin' && (
          <button onClick={() => setCoachTab('team')} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${coachTab === 'team' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>Команда</button>
        )}
      </div>

      {coachTab === 'report' && (
        <div className="animate-fade-in">
          <div className="flex gap-2 mb-4 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1 font-medium">Период с</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full text-sm outline-none bg-transparent font-medium cursor-pointer"/>
            </div>
            <div className="w-px bg-gray-200"></div>
            <div className="flex-1 pl-2">
              <label className="block text-xs text-gray-500 mb-1 font-medium">по</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full text-sm outline-none bg-transparent font-medium cursor-pointer"/>
            </div>
          </div>

          {/* ФИЛЬТР ТРЕНЕРОВ */}
          {['admin', 'manager'].includes(userRole) && (
            <div className="mb-6 flex flex-wrap gap-2">
              <button onClick={() => setSelectedCoaches([])} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${selectedCoaches.length === 0 ? 'bg-black text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                Все
              </button>
            {coaches
              .filter(coach => coach.is_trainer || (coach.lessons && coach.lessons.length > 0) || (coach.payouts && coach.payouts.length > 0))
              .map(coach => (
                <button key={coach.id} onClick={() => toggleCoachFilter(coach.full_name)} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${selectedCoaches.includes(coach.full_name) ? 'bg-black text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                  {coach.google_name || coach.full_name}
                </button>
              ))}
            </div>
          )}

        {['admin', 'manager'].includes(userRole) && coaches.filter(c => c.is_trainer || (c.lessons && c.lessons.length > 0) || (c.payouts && c.payouts.length > 0)).length === 0 && <p className="text-gray-400 text-sm text-center mt-10">В этом периоде нет записей</p>}

          <div className="space-y-4">
            {coaches
            .filter(coach => coach.is_trainer || (coach.lessons && coach.lessons.length > 0) || (coach.payouts && coach.payouts.length > 0))
              .filter(c => {
                if (['admin', 'manager'].includes(userRole)) {
                  return selectedCoaches.length === 0 || selectedCoaches.includes(c.full_name);
                }
                return Number(c.telegram_id) === Number(currentUser?.id);
              })
              .map(coach => (
              <div key={coach.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
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
                    <p className={`font-semibold text-lg ${coach.balance_due > 0 ? 'text-black' : 'text-gray-400'}`}>{coach.balance_due} ₽</p>
                  </div>
                </div>

                {expandedCoachId === coach.id && (
                  <div className="bg-[#fafafa] border-t border-gray-100 p-4 animate-fade-in">
                    {/* Кнопка выплаты */}
                    {coach.balance_due > 0 && userRole === 'admin' && (
                      <div className="mb-5">
                        <button onClick={(e) => { e.stopPropagation(); handleCoachPayout(coach.id, coach.full_name, coach.balance_due); }} className="w-full py-2.5 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm">
                          Зафиксировать выплату
                        </button>
                      </div>
                    )}

                    {coach.payouts && coach.payouts.length > 0 && (
                      <div className="mb-4">
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

                    {coach.lessons && coach.lessons.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold text-gray-400 mb-2 uppercase tracking-widest">Проведенные занятия ({coach.lessons.length})</p>
                        <div className="space-y-2">
                          {coach.lessons
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .map((lesson, idx) => {
                              const isUnpaid = lesson.payment_status === 'unpaid';
                              const isPartiallyPaid = lesson.payment_status === 'partially_paid';
                              const isPaid = lesson.payment_status === 'paid';

                            return (
                              <div key={idx} className={`grid grid-cols-[1fr_auto_auto] items-center gap-3 text-sm bg-white p-2.5 rounded-lg border shadow-sm ${!isUnpaid && ['admin', 'manager'].includes(userRole) ? 'border-green-200' : 'border-gray-200'}`}>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <p className="font-medium text-gray-800">{new Date(lesson.date).toLocaleDateString('ru-RU')}</p>
                                    {['admin', 'manager'].includes(userRole) && isPaid && <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded">Оплачен</span>}
                                    {['admin', 'manager'].includes(userRole) && isPartiallyPaid && <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded">Частично</span>}
                                  </div>
                                  <p className="text-xs text-gray-500 truncate">{lesson.students || 'Нет учеников'}</p>
                                </div>
                                
                                <div className="flex items-center gap-2 px-1">
                                  {isUnpaid && (
                                    <>
                                      <button onClick={(e) => handleEditClick(e, lesson)} className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 rounded-md hover:bg-blue-50 active:bg-blue-100" title="Редактировать">
                                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                      </button>
                                      <button onClick={(e) => { e.stopPropagation(); handleDeleteLesson(lesson.id, lesson.payment_status); }} className="text-gray-400 hover:text-red-600 transition-colors p-1.5 rounded-md hover:bg-red-50 active:bg-red-100" title="Удалить">
                                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                      </button>
                                    </>
                                  )}
                                </div>

                                <div className="text-right whitespace-nowrap pl-1">
                                  <span className="font-semibold text-gray-700">+{lesson.salary || 0} ₽</span>
                                </div>
                              </div>
                            );
                          })}
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

      {coachTab === 'team' && userRole === 'admin' && (
        <div className="animate-fade-in space-y-4 pb-10">
          <button 
            onClick={() => setShowAddCoachModal(true)}
            className="w-full bg-black text-white font-semibold text-[14px] py-3.5 px-4 rounded-xl hover:bg-gray-800 transition-colors shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 mb-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Добавить сотрудника
          </button>

          <div className="space-y-3">
            {coaches.map(coach => (
              <div key={coach.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{coach.full_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">ID: {coach.telegram_id || 'Не привязан'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${coach.role === 'admin' ? 'bg-purple-100 text-purple-700' : coach.role === 'manager' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                    {coach.role === 'admin' ? 'Админ' : coach.role === 'manager' ? 'Менеджер' : 'Тренер'}
                  </span>
                  <button onClick={() => setEditingCoach(coach)} className="text-gray-400 hover:text-blue-600 p-1.5 rounded-md hover:bg-blue-50 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {coachTab === 'add_lesson' && (
        <div className="animate-fade-in pb-10">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-gray-800">Общие данные</h2>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Тренер</label>
                <div className="relative">
                  <input 
                    type="text" 
                    required 
                    placeholder="Начните вводить имя..."
                    disabled={!['admin', 'manager'].includes(userRole)} 
                    value={batchForm.trainer} 
                    onChange={e => setBatchForm({...batchForm, trainer: e.target.value})} 
                    onFocus={() => setTrainerSearchOpen(true)}
                    onBlur={() => setTimeout(() => setTrainerSearchOpen(false), 200)}
                    className={`w-full bg-gray-50 border border-gray-200 rounded-lg pl-3 pr-10 py-2 text-[16px] outline-none transition-colors text-gray-900 caret-black ${!['admin', 'manager'].includes(userRole) ? 'opacity-60 cursor-not-allowed' : 'focus:border-black'}`}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${trainerSearchOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>

                  {trainerSearchOpen && ['admin', 'manager'].includes(userRole) && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto animate-fade-in">
                      {coaches.filter(c => c.is_trainer || (c.lessons && c.lessons.length > 0)).filter(c => (c.google_name || c.full_name).toLowerCase().includes(batchForm.trainer.toLowerCase())).length > 0 ? (
                        coaches
                          .filter(c => c.is_trainer || (c.lessons && c.lessons.length > 0))
                          .filter(c => (c.google_name || c.full_name).toLowerCase().includes(batchForm.trainer.toLowerCase()))
                          .map(coach => {
                            const displayName = coach.google_name || coach.full_name;
                            return (
                            <div 
                              key={coach.id} 
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setBatchForm({...batchForm, trainer: displayName});
                                setTrainerSearchOpen(false);
                              }}
                              className="px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200 cursor-pointer border-b border-gray-50 last:border-0"
                            >
                              {displayName}
                            </div>
                          )})
                      ) : (
                        <div className="px-3 py-3 text-sm text-gray-400 text-center">Тренер не найден</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase">Дата занятия</label>
                <input 
                  type="date" 
                  required
                  value={batchForm.lesson_date} 
                  onChange={e => setBatchForm({...batchForm, lesson_date: e.target.value})}
                  className="w-full box-border bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[16px] outline-none focus:border-black transition-colors text-gray-700 appearance-none min-h-[42px]"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-bold text-gray-800">Уроки ({batchForm.rows.length})</h2>
              {batchForm.rows.map((row, index) => (
                <div key={row.id} className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm relative animate-fade-in">
                  {batchForm.rows.length > 1 && (
                    <button type="button" onClick={() => removeLessonRow(row.id)} className="absolute top-3 right-3 text-red-400 hover:text-red-600 p-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  )}
                  <div className="text-xs font-bold text-gray-300 mb-3 uppercase">Урок #{index + 1}</div>

                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase">Длительность</label>
                        <select value={row.duration} onChange={e => updateLessonRow(row.id, 'duration', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-[16px] outline-none focus:border-black appearance-none text-gray-700">
                          <option value="25">25 мин</option>
                          <option value="45">45 мин</option>
                          <option value="60">60 мин</option>
                          <option value="90">90 мин</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase">Локация</label>
                        <select value={row.location} onChange={e => updateLessonRow(row.id, 'location', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-[16px] outline-none focus:border-black appearance-none text-gray-700">
                          <option value="Черемушки">Черемушки</option>
                          <option value="Пражка">Пражка</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase">Ученик 1</label>
                      <div className="space-y-2">
                        <div className="relative">
                          <input 
                            type="text" required placeholder="Начните вводить..." value={row.student_1} 
                            onChange={e => updateLessonRow(row.id, 'student_1', e.target.value)} onFocus={() => updateLessonRow(row.id, 'search1Open', true)} onBlur={() => setTimeout(() => updateLessonRow(row.id, 'search1Open', false), 200)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-[16px] outline-none focus:border-black text-gray-700 caret-black"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <svg className={`w-4 h-4 text-gray-400 transition-transform ${row.search1Open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </div>
                          {row.search1Open && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto animate-fade-in">
                              {students.filter(s => s.full_name.toLowerCase().includes(row.student_1.toLowerCase())).length > 0 ? (
                                students.filter(s => s.full_name.toLowerCase().includes(row.student_1.toLowerCase())).map(s => (
                                  <div key={s.id} onMouseDown={(e) => { e.preventDefault(); updateLessonRow(row.id, 'student_1', s.full_name); updateLessonRow(row.id, 'search1Open', false); }} className="px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200 cursor-pointer border-b border-gray-50 last:border-0">
                                    {s.full_name}
                                  </div>
                                ))
                              ) : (
                                <div className="px-3 py-3 text-sm text-gray-400 text-center">Не найден</div>
                              )}
                            </div>
                          )}
                        </div>
                        {row.student_1 && userRole === 'admin' && (
                          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={row.is_cash_1 || false}
                              onChange={e => updateLessonRow(row.id, 'is_cash_1', e.target.checked)}
                              className="w-4 h-4 rounded text-black border-gray-300 focus:ring-black"
                            />
                            Оплата наличными
                          </label>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase">Ученик 2 (Опционально)</label>
                      <div className="space-y-2">
                        <div className="relative">
                          <input 
                            type="text" placeholder="Начните вводить..." value={row.student_2} 
                            onChange={e => updateLessonRow(row.id, 'student_2', e.target.value)} onFocus={() => updateLessonRow(row.id, 'search2Open', true)} onBlur={() => setTimeout(() => updateLessonRow(row.id, 'search2Open', false), 200)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-[16px] outline-none focus:border-black text-gray-700 caret-black"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <svg className={`w-4 h-4 text-gray-400 transition-transform ${row.search2Open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </div>
                          {row.search2Open && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto animate-fade-in">
                              {students.filter(s => s.full_name !== row.student_1 && s.full_name.toLowerCase().includes(row.student_2.toLowerCase())).length > 0 ? (
                                students.filter(s => s.full_name !== row.student_1 && s.full_name.toLowerCase().includes(row.student_2.toLowerCase())).map(s => (
                                  <div key={s.id} onMouseDown={(e) => { e.preventDefault(); updateLessonRow(row.id, 'student_2', s.full_name); updateLessonRow(row.id, 'search2Open', false); }} className="px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200 cursor-pointer border-b border-gray-50 last:border-0">
                                    {s.full_name}
                                  </div>
                                ))
                              ) : (
                                <div className="px-3 py-3 text-sm text-gray-400 text-center">Не найден</div>
                              )}
                            </div>
                          )}
                        </div>
                        {row.student_2 && userRole === 'admin' && (
                          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={row.is_cash_2 || false}
                              onChange={e => updateLessonRow(row.id, 'is_cash_2', e.target.checked)}
                              className="w-4 h-4 rounded text-black border-gray-300 focus:ring-black"
                            />
                            Оплата наличными
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addLessonRow} className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-500 font-medium rounded-xl hover:border-black hover:text-black transition-colors flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                Добавить еще урок
              </button>
            </div>
            <button type="submit" className="w-full bg-black text-white font-medium py-3.5 rounded-xl hover:bg-gray-800 transition-colors shadow-md text-lg mt-6">
              Сохранить все уроки
            </button>
          </form>
        </div>
      )}
    </div>
  );
}