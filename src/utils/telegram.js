export const isTgEnvironment = () => {
  return window.Telegram?.WebApp?.platform && window.Telegram.WebApp.platform !== 'unknown';
};

export const showAlert = (message) => {
  if (isTgEnvironment() && window.Telegram?.WebApp?.showAlert) {
    window.Telegram.WebApp.showAlert(message);
  } else {
    alert(message); // Фолбэк для обычного браузера
  }
};

export const showConfirm = (message, callback) => {
  if (isTgEnvironment() && window.Telegram?.WebApp?.showConfirm) {
    window.Telegram.WebApp.showConfirm(message, callback);
  } else {
    callback(window.confirm(message)); // Фолбэк для обычного браузера
  }
};
