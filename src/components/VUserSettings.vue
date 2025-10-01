<template>
  <div class="content">
    <div class="form" style="padding: 15px 25px !important;margin-bottom: 15px;">
      <ul>
        <li>Выполнение некоторых запросов требует времени. Активируйте наш Telegram-бот для получения уведомлений о
          завершении обработки запросов.
        </li>
      </ul>
    </div>
    <div class="form">
      <div class="flex">
        <div
            style="
                    font-size: 22px;
                    font-weight: 600;
                    line-height: 1;
                    margin-bottom: 9px;
                "
        >
          Уведомления в Telegram
        </div>
        <button class="btn password-btn" style="margin-top: 0;">
          <a href="https://t.me/iasdetectivebot" target="_blank" class="nav-link">
            Подключить уведомления
          </a>
        </button>
      </div>
    </div>

    <div class="form">
      <div
          style="
                    font-size: 22px;
                    font-weight: 600;
                    line-height: 1;
                    margin-bottom: 9px;
                "
      >
        Сменить пароль
      </div>
      <div
          v-show="errorMessage || success"
          class="flex items-center justify-between"
          :class="success ? 'change-password__success' : 'change-password__error'"
          style="display: flex; justify-content: center; align-items: center; margin-bottom: 10px"
      >
        <i
            class="fa fa-exclamation-circle"
            aria-hidden="true"
            style="margin-right: 4px; padding-top: 2px;"
        ></i>
        {{ success ? 'Пароль был изменен.' : errorMessage }}
      </div>
      <div class="inputs">
        <div class="flex flex-col w-full parent-prompt top-input">
          <input
              v-model="oldPassword" type="text" title="some title ..."
              style="margin-right:0;margin-bottom: 0;" placeholder="Старый пароль"
          >
          <small class="prompt">Введите свой настояший пароль</small>
        </div>
        <div
            class="flex flex-col w-full parent-prompt top-input"
            style="margin-right: 20px;margin-bottom: 0;align-items: start;"
        >
          <input
              style="margin-right:0;margin-bottom: 0;" v-model="newPassword" type="text"
              placeholder="Новый пароль"
          >
          <small class="prompt">Создайте новый пароль</small>
        </div>
        <div class="flex flex-col w-full parent-prompt top-input" style="margin-bottom: 0;align-items: start;">
          <input
              style="margin-right:0;margin-bottom: 0;" v-model="newPasswordConfirm" type="text"
              placeholder="Повторить новый пароль"
          >
          <small class="prompt">Повторите новый пароль для подтверждения</small>
        </div>
      </div>
      <button
          v-show="oldPassword && newPassword && newPasswordConfirm"
          class="btn password-btn"
          @click="validateData"
      >
        Сменить пароль
      </button>
    </div>

    <div class="form--language">
      <div>
        <div
            style="
                    font-size: 22px;
                    font-weight: 600;
                    line-height: 1;
                    margin-bottom: 9px;
                "
        >
          Язык по умолчанию
        </div>
        <div
            v-show="languageSuccess || languageErrorMessage"
            class="flex items-center justify-between"
            :class="languageSuccess ? 'change-password__success' : 'change-password__error'"
            style="display: flex; justify-content: center; align-items: center; margin-top: 10px; margin-bottom: 10px"
        >
          <i
              class="fa fa-exclamation-circle"
              aria-hidden="true"
              style="margin-right: 4px; padding-top: 2px;"
          ></i>
          {{ languageSuccess ? 'Язык по умолчанию был успешно установлен.' : languageErrorMessage }}
        </div>
        <div style="margin-right: 20px">
          <multiselect
              v-model="checkedLanguage"
              :options="languageOptions"
              :multiple="false"
              :close-on-select="true"
              placeholder="Поиск языков"
              label="name"
              track-by="name"
              selectLabel="Нажмите enter, чтобы выбрать"
              deselectLabel="Нажмите enter, чтобы удалить"
              selectedLabel="Выбрано"
          ></multiselect>
        </div>
        <div style="display: flex; justify-content: end; align-items: center; margin-top: 10px">
          <button
              v-show="checkedLanguage"
              class="btn password-btn"
              @click="setDefaultLanguage"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Multiselect from 'vue-multiselect';

const languageOptions = JSON.parse(localStorage.getItem('languages'));
const defaultLanguage = localStorage.getItem('defaultLanguage');
const checkedLanguage = ref(defaultLanguage && defaultLanguage !== 'null' ? JSON.parse(defaultLanguage) : {
  name: 'Русский',
  code: 'ru'
});
const languageErrorMessage = ref('');
const languageSuccess = ref(false);
const oldPassword = ref('');
const newPassword = ref('');
const newPasswordConfirm = ref('');
const errorMessage = ref('');
const success = ref(false);

const validateData = () => {
  errorMessage.value = '';
  if (newPassword.value !== oldPassword.value) {
    newPassword.value === newPasswordConfirm.value
        ? updatePassword()
        : errorMessage.value = 'Ошибка! Новый пароль и его повтор не совпадают.';
  } else {
    errorMessage.value = 'Ошибка! Новый пароль и старый пароль не должны совпадать.';
  }
};

const updatePassword = () => {
  fetch(`/api/users/change_password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
      old_password: oldPassword.value,
      new_password: newPassword.value
    })
  })
      .then((response) => {
        response?.status === 200 ? success.value = true : errorMessage.value = 'Ошибка! Не удалось изменить пароль.';
      });
};

const setDefaultLanguage = () => {
  languageSuccess.value = false;
  languageErrorMessage.value = '';
  fetch(`/api/users/set_default_language`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
      default_language_code: checkedLanguage.value.code
    })
  })
      .then(async (response) => {
        if (response?.status === 200) {
          try {
            const res = await fetch(`/api/users/default_language`);
            let data = await res.json();
            const defaultLanguage =
                JSON.parse(localStorage.getItem('languages')).find((el) => el.code === data.default_language_code);
            defaultLanguage
                ? localStorage.setItem('defaultLanguage', JSON.stringify(defaultLanguage))
                : localStorage.setItem('defaultLanguage', JSON.stringify([{name: 'Русский', code: 'ru'}]));
            languageSuccess.value = true;
          } catch (error) {
            languageErrorMessage.value = 'Ошибка! Не удалось применить настройки. Попробуйте обновить страницу.';
          }
        } else {
          languageErrorMessage.value = 'Ошибка! Не удалось установить язык по умолчанию.';
        }
      });
};
</script>

<style scoped>
.form input[type="email"],
.form input[type="password"],
.form input[type="text"] {
  height: 30px;
  padding: 0 7px;
}

.content {
  padding: 20px;
}

.info div {
  background: white;
  max-width: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  padding: 15px;
  border-radius: 5px;
}

.info div svg {
  width: 50px;
}

.info div span {
  text-align: center;
  margin-top: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.form, .form--language {
  padding: 15px;
  background: white;
  margin: 15px auto auto;
  max-width: 900px;
  border-radius: 5px;
}

.form .inputs {
  display: flex;
}

.form input:not(.form input:last-child) {
  margin-right: 20px;
}

.form input {
  border: 1px solid #D9D9D9;
  display: flex;
  height: 38px;
  padding: 0 10px;
  border-radius: 4px;
  font-size: 16px;
  width: 100%;
}

.form input::placeholder {
  color: #a8a6a6;
}

.form .btn {
  margin-top: 10px;
  margin-left: auto !important;
  font-size: 13px;
  border: none;
  height: 30px;
}

.form ul {
  list-style: none
}

.form li:not(.form li:last-child) {
  margin-bottom: 0.5em;
}

.form li::before {
  content: "\2022";
  color: rgb(26, 179, 148);
  font-weight: bold;
  display: inline-block;
  width: 1em;
  margin-left: -1em;
}

.password-btn {
  margin-right: 20px;
}

.head-item .item {
  font-size: 16px;
  font-weight: 600;
}

.prohibited_sites p:not(.prohibited_sites p:last-child) {
  border-bottom: 1px solid #dadde1;
}

.prohibited_sites p {
  cursor: pointer;
  height: 30px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.prohibited_sites p i {
  color: #ed5565;
}

.ssss .fa-angle-down {
  position: absolute;
  right: calc(77.46px);
  height: 30px;
  width: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.top-input {
  margin-right: 20px;
  align-items: start;
  flex-direction: column;
}

.parent-prompt {
  position: relative;
}

.prompt {
  position: absolute;
  bottom: calc(100% + 7px);
  left: 0;
  font-size: 13px;
  background: #404f5d;
  color: white;
  padding: 6px;
  border-radius: 6px;
  transition: .15s;
  opacity: 0;
}

.parent-prompt input:focus + .prompt {
  opacity: 1;
}

.prompt::after {
  content: '▶';
  position: absolute;
  top: 100%;
  left: 20px;
  color: #404f5d;
  height: 9px;
  transform: rotate(90deg);
}

.nav-link {
  display: flex;
  align-items: center;
  color: #ffffff !important;
  cursor: pointer;
  transition: .15s;
  text-decoration: none;
  padding: 0 15px;
  height: 40px;
  font-size: 14px;
}

button.add-item:hover {
  background: rgb(22, 144, 119) !important;
}

.change-password__error,
.change-password__success {
  border: 1px solid red;
  border-radius: 3px;
  background: #f1f4f9;
  height: 35px;
  justify-content: center !important;
  color: red;
  margin: 10px 20px 0 0;
}

.change-password__success {
  border: 1px solid green;
  color: green;
}
</style>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style>
.multiselect__tag {
  background-color: #1AB394;
}

.multiselect__tag-icon::after {
  color: #ffffff;
}

.multiselect__option--highlight {
  background: #1AB394;
}
</style>