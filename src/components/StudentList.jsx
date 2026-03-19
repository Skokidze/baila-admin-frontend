import React, { useState } from 'react';

export default function StudentList({
  students,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  userRole, // Новое: роль пользователя
  setShowAddStudentModal, // Новое: функция для открытия модалки
  setEditingStudent // Принимаем функцию открытия модалки
}) {
  // Эти стейты нужны только внутри списка учеников, поэтому мы убрали их из App.jsx
  const [studentFilter, setStudentFilter] = useState('debts'); 
  const [searchStudent, setSearchStudent] = useState(''); 
  const [expandedStudentId, setExpandedStudentId] = useState(null);

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-4 tracking-tight">Ученики</h1>
      
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

      {userRole === 'admin' && (
        <button onClick={() => setShowAddStudentModal(true)} className="w-full py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors shadow-sm mb-4">
          Добавить ученика
        </button>
      )}

      <div className="mb-6 space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <input type="text" placeholder="Поиск по имени..." value={searchStudent} onChange={(e) => setSearchStudent(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-[16px] focus:border-black outline-none transition-colors shadow-sm text-gray-900 caret-black"/>
          {searchStudent && (
            <button onClick={() => setSearchStudent('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-black">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          )}
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button onClick={() => {setStudentFilter('all'); setSearchStudent('');}} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${studentFilter === 'all' && !searchStudent ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>Все</button>
          <button onClick={() => {setStudentFilter('debts'); setSearchStudent('');}} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${studentFilter === 'debts' && !searchStudent ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>Должники</button>
        </div>
      </div>

      <div className="space-y-4">
        {students
          .filter(student => {
            if (searchStudent) return student.full_name.toLowerCase().includes(searchStudent.toLowerCase());
            if (studentFilter === 'debts') return Number(student.unpaid_debt) > 0;
            return true;
          })
          .sort((a, b) => { // Сортировка: сначала должники, потом по имени
            const debtA = Number(a.unpaid_debt) > 0 ? 1 : 0;
            const debtB = Number(b.unpaid_debt) > 0 ? 1 : 0;
            return debtB - debtA || a.full_name.localeCompare(b.full_name);
          })
          .map(student => (
          <div key={student.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
            <div className="p-5 cursor-pointer" onClick={() => setExpandedStudentId(expandedStudentId === student.id ? null : student.id)}>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg text-gray-900">{student.full_name}</h3>
                  {userRole === 'admin' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingStudent(student); }}
                      className="text-gray-400 hover:text-blue-600 p-1.5 rounded-md hover:bg-blue-50 active:bg-blue-100 transition-colors"
                    >
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  )}
                </div>
                <svg className={`w-4 h-4 text-gray-400 transform transition-transform ${expandedStudentId === student.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
              
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Баланс (сейчас)</p>
                  <p className={`font-medium ${Number(student.balance) > 0 ? 'text-green-600' : 'text-gray-900'}`}>{student.balance} ₽</p>
                </div>
                <div className="w-px bg-gray-200"></div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Долг (сейчас)</p>
                  <p className={`font-medium ${Number(student.unpaid_debt) > 0 ? 'text-red-500 flex items-center gap-1.5' : 'text-gray-900'}`}>
                    {Number(student.unpaid_debt) > 0 && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>}
                    {student.unpaid_debt} ₽
                  </p>
                </div>
              </div>
            </div>

            {expandedStudentId === student.id && (
              <div className="bg-[#fafafa] border-t border-gray-100 p-4 animate-fade-in">
                {/* Долги */}
                {student.debt_details && student.debt_details.length > 0 && (
                  <div className="mb-5">
                    <p className="text-[11px] font-semibold text-gray-400 mb-2 uppercase tracking-widest">Текущие долги ({student.debt_details.length})</p>
                    <div className="space-y-2">
                      {student.debt_details.map((lesson, index) => (
                        <div key={`debt-${index}`} className="flex justify-between items-center text-sm bg-white p-2.5 rounded-lg border border-red-100 shadow-sm">
                          <div>
                            <p className="font-medium text-gray-800">{new Date(lesson.lesson_date).toLocaleDateString('ru-RU')}</p>
                            <p className="text-xs text-gray-500 mt-0.5">Тренер: {lesson.trainer_name}</p>
                          </div>
                          <span className="font-semibold text-red-500">-{lesson.debt_amount} ₽</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* История */}
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 mb-2 uppercase tracking-widest">История уроков за период ({student.history?.length || 0})</p>
                  {student.history && student.history.length > 0 ? (
                    <div className="space-y-2">
                      {student.history
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map((lesson, index) => (
                        <div key={`hist-${index}`} className={`flex justify-between items-center text-sm bg-white p-2.5 rounded-lg border shadow-sm ${lesson.is_paid ? 'border-green-200' : 'border-gray-200'}`}>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="font-medium text-gray-800">{new Date(lesson.date).toLocaleDateString('ru-RU')}</p>
                              {lesson.is_paid && <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded">Оплачен</span>}
                            </div>
                            <p className="text-xs text-gray-500">Тренер: {lesson.trainer} • {lesson.type === 'сплит' ? 'Пара' : lesson.type === 'индивидуальный' ? 'Соло' : lesson.type}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 bg-white p-3 rounded-lg border border-dashed border-gray-200 text-center">В этом периоде уроков не было</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {students.filter(s => {
          if (searchStudent) return s.full_name.toLowerCase().includes(searchStudent.toLowerCase());
          if (studentFilter === 'debts') return Number(s.unpaid_debt) > 0;
          return true;
        }).length === 0 && (
          <p className="text-gray-400 text-sm text-center mt-10">Ничего не найдено</p>
        )}
      </div>
    </div>
  );
}