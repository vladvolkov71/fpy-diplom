const validateUsername = (username) => {
  const usernamePattern = /^[a-zA-Z][a-zA-Z0-9]/g;

  if (!usernamePattern.test(username)) {
    return {
      ok: false,
      message: 'Имя должно состоять из латинских букв и цифр',
    };
  }

  if (username.length < 4 || username.length > 20) {
    return {
      ok: false,
      message: 'Имя должно быть длинной от 4 до 20 символов',
    };
  }

  return {
    ok: true,
  };
};

const validatePassword = (password) => {
  const numberPattern = /\d/;
  const specialLettersPattern = /[ `!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/;

  if (password.length < 6) {
    return {
      ok: false,
      message: 'Длинна пароля должна быть больше 6 символов',
    };
  }

  if (password === password.toLowerCase()) {
    return {
      ok: false,
      message: 'Пароль должен содержать заглавные буквы',
    };
  }

  if (!numberPattern.test(password)) {
    return {
      ok: false,
      message: 'Пароль должен содержать цифры',
    };
  }

  if (!specialLettersPattern.test(password)) {
    return {
      ok: false,
      message: 'Пароль должен содержать спецсимволы',
    };
  }

  return {
    ok: true,
  };
};

export { validateUsername, validatePassword };
