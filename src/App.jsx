import React, { useState, useEffect } from 'react';
import EditLessonModal from './components/EditLessonModal';
import AddStudentModal from './components/AddStudentModal';
import EditStudentModal from './components/EditStudentModal';
import StudentList from './components/StudentList';
import CoachTab from './components/CoachTab';
import MainTab from './components/MainTab';
import AddCoachModal from './components/AddCoachModal';
import EditCoachModal from './components/EditCoachModal';
import { showAlert, showConfirm } from './utils/telegram';
import { useAppData } from './hooks/useAppData';
import { useBatchLessons } from './hooks/useBatchLessons';

const BACKEND_URL = import.meta.env.DEV ? 'http://localhost:3000/api' : 'https://baila-api.onrender.com/api';
console.log('Текущий адрес бэкенда:', BACKEND_URL); // Добавим лог для проверки

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('trainer'); // 'admin' или 'trainer'
  const [schoolId, setSchoolId] = useState(null); // НОВЫЙ СТЕЙТ: ID школы

  // НОВЫЙ СТЕЙТ
  const [isAuthorized, setIsAuthorized] = useState(null); // null = проверка, true = можно, false = нельзя

  const [activeTab, setActiveTab] = useState('main');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false); // Новый стейт для модалки добавления ученика
  const [showAddCoachModal, setShowAddCoachModal] = useState(false); // Стейт для модалки тренера
  const [editingStudent, setEditingStudent] = useState(null); // Стейт для модалки настроек ученика
  const [editingCoach, setEditingCoach] = useState(null); // Стейт для модалки редактирования тренера

    // Стейт для скрытия меню при открытой клавиатуре
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);


  // --- СТЕЙТЫ И ФУНКЦИИ ДЛЯ РЕДАКТИРОВАНИЯ УРОКА ---
  const [editingLesson, setEditingLesson] = useState(null); 

  const handleEditClick = (e, lesson) => {
    e.stopPropagation();
    // Разбиваем строку учеников (например "Степан, Вова")
    const studentsArr = lesson.students ? lesson.students.split(', ') : [];
    
    // Форматируем дату в YYYY-MM-DD для поля <input type="date">
    let formattedDate = '';
    if (lesson.date) {
      const d = new Date(lesson.date);
      formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    setEditingLesson({
      id: lesson.id,
      date: formattedDate,
      student_1: studentsArr[0] || '',
      student_2: studentsArr[1] || '',
      duration: lesson.duration || '45',
      location: lesson.location || '',
      is_cash_1: lesson.is_cash_1 || false,
      is_cash_2: lesson.is_cash_2 || false
    });
  };

  const handleSaveEditLesson = async (updatedData) => {
    if (!updatedData.student_1) return showAlert('Ученик 1 обязателен');

    // Ищем ID учеников по их именам перед отправкой на сервер
    const st1Obj = students.find(s => s.full_name === updatedData.student_1);
    const st2Obj = students.find(s => s.full_name === updatedData.student_2);

    try {
      const response = await fetch(`${BACKEND_URL}/lessons/${updatedData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-school-id': String(schoolId) },
        body: JSON.stringify({
          lesson_date: updatedData.date,
          student_1: updatedData.student_1,
          student_2: updatedData.student_2 || '',
          student_1_id: st1Obj ? st1Obj.id : null,
          student_2_id: st2Obj ? st2Obj.id : null,
          duration: updatedData.duration,
          location: updatedData.location,
          is_cash_1: updatedData.is_cash_1,
          is_cash_2: updatedData.is_cash_2
        })
      });

      if (response.ok) {
        setEditingLesson(null); // Закрываем модалку
        fetchData(); // Обновляем списки
      } else {
        const err = await response.json();
        showAlert(`Ошибка: ${err.error}`);
      }
    } catch (error) {
      console.error('Ошибка при редактировании урока:', error);
      showAlert('Ошибка при отправке данных на сервер');
    }
  };


  
  // --- ПОДКЛЮЧАЕМ КАСТОМНЫЙ ХУК ---
  const {
    students, coaches, loading, errorMsg,
    startDate, setStartDate, endDate, setEndDate,
    fetchData
  } = useAppData(BACKEND_URL, schoolId);

  // Хук для управления формой пакетного добавления уроков
  const { batchForm, setBatchForm, addLessonRow, updateLessonRow, removeLessonRow, handleBatchSubmit, isSubmitting } = useBatchLessons(BACKEND_URL, schoolId, students, coaches, currentUser, userRole, fetchData);


    useEffect(() => {
    const handleFocusIn = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
        setIsKeyboardVisible(true);
      }
    };
    const handleFocusOut = () => {
      setIsKeyboardVisible(false);
    };

    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);

    return () => {
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  // Инициализация Telegram
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    const user = tg?.initDataUnsafe?.user;

    if (user) {
      tg.ready();
      tg.expand();
      
      setCurrentUser(user);
    } else {
      // --- РЕЖИМ ОТЛАДКИ В БРАУЗЕРЕ ---
      console.log('Запуск вне Telegram: включен режим отладки');
      // ВПИШИТЕ СЮДА ВАШ TELEGRAM ID ДЛЯ ТЕСТИРОВАНИЯ РОЛЕЙ:
      setCurrentUser({ id: '474108242', first_name: 'DebugUser' });
    }
  }, []);

  // Загрузка данных и проверка авторизации по базе данных
  useEffect(() => {
    if (!currentUser) return;

    const authUser = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/auth/telegram/${currentUser.id}`);
        if (response.ok) {
          const data = await response.json();
          setSchoolId(data.user.school_id);
          setUserRole(data.user.role || 'trainer');
          setActiveTab(data.user.role === 'admin' ? 'main' : 'coaches');
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error('Ошибка авторизации:', error);
        setIsAuthorized(false);
      }
    };

    authUser();
  }, [currentUser]);




  // API Вызовы (Финансы и Удаление)
  const handleCoachPayout = async (id, name, recommendedAmount) => {
    const amountStr = prompt(`Оформить выплату для: ${name}\nК выплате: ${recommendedAmount} ₽\n\nВведите сумму:`, recommendedAmount);
    if (!amountStr) return;
    const amount = Number(amountStr);
    if (isNaN(amount) || amount <= 0) return showAlert('Неверная сумма');
    const dateStr = prompt(`Дата выплаты (ГГГГ-ММ-ДД):`, new Date().toISOString().split('T')[0]);
    if (!dateStr) return;

    try {
      const response = await fetch(`${BACKEND_URL}/coaches/${id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-school-id': String(schoolId) },
        body: JSON.stringify({ amount, date: dateStr })
      });
      if (response.ok) {
        showAlert('Выплата зафиксирована!');
        fetchData();
      }
    } catch (e) {
      console.error('Ошибка при сохранении выплаты:', e);
      showAlert('Ошибка при сохранении');
    }
  };

  const handleTopUp = async (id, name) => {
    const amountStr = prompt(`Введите сумму пополнения для: ${name}`);
    if (!amountStr) return;
    const amount = Number(amountStr);
    if (amount > 0) {
      try {
        const response = await fetch(`${BACKEND_URL}/students/${id}/topup`, {
          method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-school-id': String(schoolId) },
          body: JSON.stringify({ amount })
        });
        if (response.ok) {
          showAlert('Баланс пополнен!');
          fetchData();
        }
      } catch (error) {
        console.error('Ошибка при пополнении баланса:', error);
        showAlert('Ошибка при пополнении');
      }
    }
  };

  const handleSetBalance = async (id, name, currentBalance) => {
    const amountStr = prompt(`Изменить баланс для: ${name}\nТекущий: ${currentBalance} ₽\n\nНовый баланс:`, currentBalance);
    if (amountStr === null) return; 
    const amount = Number(amountStr);
    if (isNaN(amount)) return showAlert('Неверная сумма');

    try {
      const response = await fetch(`${BACKEND_URL}/students/${id}/balance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-school-id': String(schoolId) },
        body: JSON.stringify({ balance: amount })
      });
      if (response.ok) {
        showAlert('Баланс изменен!');
        fetchData();
      }
    } catch (error) {
      console.error('Ошибка при изменении баланса:', error);
      showAlert('Ошибка при изменении баланса');
    }
  };

  const handlePayAllDebts = async () => {
    showConfirm(`Вы уверены, что хотите обновить балансы всех учеников?`, async (isConfirmed) => {
      if (!isConfirmed) return;
      try {
        const response = await fetch(`${BACKEND_URL}/pay-unpaid-lessons`, {
          method: 'POST',
          headers: { 'x-school-id': String(schoolId) }
        });
        if (response.ok) {
          showAlert('Балансы успешно обновлены!');
          fetchData();
        } else {
          const err = await response.json();
          showAlert(`Ошибка: ${err.error}`);
        }
      } catch (error) {
        console.error('Ошибка при списании долгов:', error);
        showAlert('Ошибка при обновлении балансов');
      }
    });
  };

  const handleDeleteLesson = (lessonId, paymentStatus) => {
    if (paymentStatus !== 'unpaid') return showAlert('Этот урок оплачен, его нельзя удалить.');

    showConfirm('Вы уверены, что хотите удалить этот урок? Это действие нельзя отменить.', async (isConfirmed) => {
      if (!isConfirmed) return;
      try {
        const response = await fetch(`${BACKEND_URL}/lessons/${lessonId}`, { 
          method: 'DELETE',
          headers: { 'x-school-id': String(schoolId) }
        });
        if (response.ok) {
          fetchData();
        } else {
          const err = await response.json();
          showAlert(`Ошибка: ${err.error}`);
        }
      } catch (e) {
        console.error('Ошибка при удалении урока:', e);
        showAlert('Ошибка при удалении');
      }
    });
  };

  // --- ФУНКЦИИ УПРАВЛЕНИЯ УЧЕНИКАМИ (АДМИН) ---
  const handleAddStudent = async (fullName, googleName, accountNumber) => {
    try {
      const response = await fetch(`${BACKEND_URL}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-school-id': String(schoolId) },
        body: JSON.stringify({ full_name: fullName, google_name: googleName, account_number: accountNumber })
      });
      if (response.ok) {
        showAlert(`Ученик ${fullName} успешно добавлен!`);
        setShowAddStudentModal(false);
        fetchData(); // Обновляем список учеников
      } else {
        const err = await response.json();
        showAlert(`Ошибка: ${err.error}`);
      }
    } catch (error) {
      console.error('Ошибка при добавлении ученика:', error);
      showAlert('Ошибка при добавлении ученика');
    }
  };

  const handleAddCoach = async (fullName, googleName, telegramId, role) => {
    try {
      const response = await fetch(`${BACKEND_URL}/coaches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-school-id': String(schoolId) },
        body: JSON.stringify({ full_name: fullName, google_name: googleName, telegram_id: telegramId, role })
      });
      if (response.ok) {
        showAlert(`Тренер ${fullName} успешно добавлен!`);
        setShowAddCoachModal(false);
        fetchData(); // Обновляем список тренеров
      } else {
        const err = await response.json();
        showAlert(`Ошибка: ${err.error}`);
      }
    } catch (error) {
      console.error('Ошибка при добавлении тренера:', error);
      showAlert('Ошибка при добавлении тренера');
    }
  };

  const handleUpdateCoach = async (coachId, fullName, telegramId, role) => {
    try {
      const response = await fetch(`${BACKEND_URL}/coaches/${coachId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-school-id': String(schoolId) },
        body: JSON.stringify({ full_name: fullName, telegram_id: telegramId, role })
      });
      if (response.ok) {
        showAlert('Данные сотрудника обновлены!');
        setEditingCoach(null);
        fetchData();
      } else {
        const err = await response.json();
        showAlert(`Ошибка: ${err.error}`);
      }
    } catch (error) {
      console.error('Ошибка при обновлении тренера:', error);
      showAlert('Ошибка при обновлении тренера');
    }
  };

  const handleFireCoach = async (coachId, coachName) => {
    showConfirm(`Вы уверены, что хотите уволить сотрудника ${coachName}? Он потеряет доступ к приложению.`, async (isConfirmed) => {
      if (!isConfirmed) return;
      try {
        const response = await fetch(`${BACKEND_URL}/coaches/${coachId}`, { 
          method: 'DELETE',
          headers: { 'x-school-id': String(schoolId) }
        });
        if (response.ok) {
          showAlert(`Сотрудник ${coachName} уволен.`);
          setEditingCoach(null);
          fetchData();
        }
      } catch (e) {
        showAlert('Ошибка при увольнении');
      }
    });
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    showConfirm(`Вы уверены, что хотите убрать ученика ${studentName} в архив?`, async (isConfirmed) => {
      if (!isConfirmed) return;
      try {
        const response = await fetch(`${BACKEND_URL}/students/${studentId}`, { 
          method: 'DELETE',
          headers: { 'x-school-id': String(schoolId) }
        });
        const data = await response.json();
        if (response.ok) {
          showAlert(data.message || `Ученик ${studentName} убран в архив.`);
          fetchData(); // Обновляем список учеников
          setEditingStudent(null); // Закрываем модалку
        } else {
          showAlert(`Ошибка: ${data.error}`);
        }
      } catch (e) {
      console.error('Ошибка при архивации ученика:', e);
        showAlert('Ошибка при архивации ученика');
      }
    });
  };

  const handleUpdateStudentName = async (studentId, newName) => {
    try {
      const response = await fetch(`${BACKEND_URL}/students/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-school-id': String(schoolId) },
        body: JSON.stringify({ full_name: newName })
      });
      if (response.ok) {
        showAlert('Данные ученика успешно изменены!');
        fetchData();
        setEditingStudent(prev => ({ ...prev, full_name: newName }));
      } else {
        const err = await response.json();
        showAlert(`Ошибка: ${err.error}`);
      }
    } catch (error) {
      console.error('Ошибка при изменении имени:', error);
      showAlert('Ошибка при изменении имени');
    }
  };

  const handleAddStudentAccount = async (studentId, accountNumber) => {
    try {
      const response = await fetch(`${BACKEND_URL}/students/${studentId}/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-school-id': String(schoolId) },
        body: JSON.stringify({ account_number: accountNumber })
      });
      if (response.ok) {
        showAlert('Счет успешно добавлен!');
      } else {
        const err = await response.json();
        showAlert(`Ошибка: ${err.error}`);
      }
    } catch (error) {
      console.error('Ошибка при добавлении счета:', error);
      showAlert('Ошибка при добавлении счета');
    }
  };

  // --- ЭКРАНЫ ЗАГРУЗКИ ---
  if (loading || (isAuthorized === null && !errorMsg)) return (
    <div className="flex h-screen items-center justify-center bg-[#fafafa]">
      <div className="text-sm font-medium text-gray-500 flex flex-col items-center gap-3">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
        Загрузка...
      </div>
    </div>
  );

  if (errorMsg) return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#fafafa] p-6 text-center">
      <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      </div>
      <div className="text-gray-900 font-semibold mb-2">Проблема с подключением</div>
      <p className="text-gray-500 text-sm mb-6 max-w-xs">{errorMsg}</p>
      <div className="text-[10px] text-gray-500 bg-gray-200 p-3 rounded-lg w-full mb-6 break-all text-left font-mono">
        DEBUG URL: {BACKEND_URL}
      </div>
      <button onClick={fetchData} className="bg-black text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
        Попробовать снова
      </button>
    </div>
  );

    // --- ЭКРАН ОТКАЗА В ДОСТУПЕ ---
  if (isAuthorized === false) return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#fafafa] p-6 text-center">
      <div className="w-16 h-16 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center mb-6">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Доступ закрыт</h2>
      <p className="text-gray-500 text-sm max-w-xs mb-8">
        Вашего Telegram ID нет в базе данных сотрудников. Обратитесь к администратору для получения доступа.
      </p>
      {currentUser && (
        <div className="bg-white px-4 py-3 border border-gray-200 rounded-xl text-xs text-gray-400">
          Ваш ID: <span className="font-mono font-bold text-gray-800">{currentUser.id}</span>
        </div>
      )}
    </div>
  );

  // --- ОСНОВНОЙ ИНТЕРФЕЙС ---
  return (
    <div className="min-h-screen bg-[#fafafa] text-[#111] font-sans pb-24">
      <div className="max-w-md mx-auto px-5 py-6 space-y-6">
        
        {/* ========================================== */}
        {/* ВКЛАДКА УЧЕНИКОВ (ТОЛЬКО ДЛЯ АДМИНА) */}
        {/* ========================================== */}
        {activeTab === 'students' && userRole === 'admin' && (
          <div className="space-y-4">
            <StudentList
              students={students}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              userRole={userRole}
              setEditingStudent={setEditingStudent}
              setShowAddStudentModal={setShowAddStudentModal}
            />
          </div>
        )}

        {/* ========================================== */}
        {/* ВКЛАДКА ТРЕНЕРОВ */}
        {/* ========================================== */}
          {/* Тренеры / Отчеты */}
          {activeTab === 'coaches' && (
          <CoachTab
            userRole={userRole}
            currentUser={currentUser}
            coaches={coaches}
            students={students}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            handleCoachPayout={handleCoachPayout}
            handleEditClick={handleEditClick}
            handleDeleteLesson={handleDeleteLesson}
            batchForm={batchForm}
            setBatchForm={setBatchForm}
            handleBatchSubmit={handleBatchSubmit}
            addLessonRow={addLessonRow}
            updateLessonRow={updateLessonRow}
            removeLessonRow={removeLessonRow}
            setShowAddCoachModal={setShowAddCoachModal}
            setEditingCoach={setEditingCoach}
            isSubmitting={isSubmitting}
          />
        )}

        {/* ========================================== */}
        {/* ГЛАВНАЯ ВКЛАДКА (ТОЛЬКО ДЛЯ АДМИНА) */}
        {/* ========================================== */}
        {activeTab === 'main' && userRole === 'admin' && (
          <MainTab
            BACKEND_URL={BACKEND_URL}
            schoolId={schoolId}
            handlePayAllDebts={handlePayAllDebts}
          />
        )}

      </div>

        {/* ========================================== */}
        {/* НИЖНЯЯ ПАНЕЛЬ НАВИГАЦИИ (СКРЫВАЕТСЯ ПРИ ВВОДЕ ТЕКСТА) */}
        {/* ========================================== */}
        {!isKeyboardVisible && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-xs bg-white border border-gray-200 rounded-full shadow-lg flex justify-between px-2 py-2 z-50">
            {userRole === 'admin' && (
              <button 
                className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors ${activeTab === 'main' ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-gray-800'}`} 
                onClick={() => setActiveTab('main')}
              >
                Главная
              </button>
            )}
            {userRole === 'admin' && (
              <button 
                className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors ${activeTab === 'students' ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-gray-800'}`} 
                onClick={() => setActiveTab('students')}
              >
                Ученики
              </button>
            )}
            <button 
              className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors ${activeTab === 'coaches' ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-gray-800'}`} 
              onClick={() => setActiveTab('coaches')}
            >
              {['admin', 'manager'].includes(userRole) ? 'Тренеры' : 'Мои уроки'}
            </button>
          </div>
        )}



      {/* МОДАЛЬНОЕ ОКНО РЕДАКТИРОВАНИЯ УРОКА */}
      {editingLesson && (
        <EditLessonModal
          initialData={editingLesson}
          students={students}
          onClose={() => setEditingLesson(null)}
          onSave={handleSaveEditLesson}
        />
      )}
      
      {/* Модальное окно настроек/архивации ученика */}
      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
          onArchive={handleDeleteStudent}
          onSetBalance={handleSetBalance}
          onTopUp={handleTopUp}
          onUpdateName={handleUpdateStudentName}
          onAddAccount={handleAddStudentAccount}
        />
      )}

      {/* Модальное окно добавления ученика */}
      {showAddStudentModal && (
        <AddStudentModal
          onClose={() => setShowAddStudentModal(false)}
          onSave={handleAddStudent}
        />
      )}

      {/* Модальное окно добавления тренера */}
      {showAddCoachModal && (
        <AddCoachModal
          onClose={() => setShowAddCoachModal(false)}
          onSave={handleAddCoach}
        />
      )}

      {/* Модальное окно редактирования тренера */}
      {editingCoach && (
        <EditCoachModal
          coach={editingCoach}
          onClose={() => setEditingCoach(null)}
          onSave={handleUpdateCoach}
          onFire={handleFireCoach}
        />
      )}

    </div>
  );
}
