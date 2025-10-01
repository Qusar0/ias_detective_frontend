<template>
  <div
      class="form"
      @keydown.enter="login"
  >
    <label>
      <div>Почта</div>
      <input
          v-model="form.email"
          type="email"
          placeholder="Ваш email"
          class="email"
          :class="{ error: email_error && validation_error }"
      >
      <small
          v-show="email_error && validation_error"
          style="color: red;margin-bottom: 15px;display: block;"
      >
        Неправильный Email
      </small>
    </label>
    <label>
      <div>Пароль</div>
      <input
          v-model="form.password"
          type="password"
          placeholder="Ваш пароль"
          class="password"
          :class="{ error: password_error && validation_error }"
      >
      <small
          v-show="password_error && validation_error"
          style="color: red;margin-bottom: 15px;display: block;"
      >
        Пароль не менее 8 символов
      </small>
    </label>
    <div class="flex items-center justify-between">
      <label class="remember-me">
        <input
            v-model="form.checked"
            type="checkbox"
        >
        - Запомнить меня
      </label>
      <button
          class="btn"
          :class="{ disabled: formIsEmpty && validation_error }"
          :disabled="formIsEmpty && validation_error"
          @click="login"
      >
        Войти
      </button>
    </div>
    <div
        style="margin-top: 10px; cursor: pointer; text-decoration: underline; color: #727476"
        @click="showReset = !showReset; authorization_error = false; resetSuccess = false;"
    >
      Сбросить пароль
    </div>
    <div
        v-if="resetSuccess || resetLoading"
        style="margin-top: 10px;"
    >
      {{ resetSuccess ? 'Письмо с дальнейшими указаниями было отправлено на указанную почту.' : 'Загрузка...' }}
    </div>
    <div
        v-if="showReset && !resetSuccess && !resetLoading"
        style="display: flex; flex-direction: column; align-items: end"
    >
      <input
          v-model="form.resetEmail"
          style="margin-top: 10px;"
          type="email"
          placeholder="Почта, для которой нужно сбросить пароль"
          class="email"
      >
      <button
          v-show="form.resetEmail"
          class="btn"
          :disabled="resetLoading"
          @click="resetPassword"
      >
        Сбросить
      </button>
    </div>
    <div
        v-show="authorization_error"
        class="flex items-center justify-between authorization_error"
    >
      {{ authorization_error_text }}
    </div>
  </div>
</template>

<script>
import { isAuthorized, user_created, user_id, user_name } from '../use/index';
import { get_events } from '../utils/notification';

export default {
  data() {
    return {
      form: {
        email: '',
        password: '',
        checked: true,
        resetEmail: ''
      },
      authorization_error: false,
      showReset: false,
      resetLoading: false,
      resetSuccess: false,
      authorization_error_text: 'Неправильная почта или пароль',
      validation_error: false
    };
  },
  setup() {
    return {isAuthorized, user_name, user_created, get_events, user_id};
  },
  methods: {
    login() {
      if (this.formIsEmpty) {
        this.validation_error = true;
        return;
      }

      fetch(`/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          email: this.form.email,
          password: this.form.password
        })
      })
          .then((response) => {
            if (response.status == 200) {

              this.isAuthorized = true;
              this.get_events();
              this.$router.go('/');
              return response?.json();
            } else {
              this.authorization_error = true;
              this.authorization_error_text = 'Неправильная почта или пароль';
            }
            this.validation_error = true;
          })
          .then((response) => {
            this.user_name = response?.email;
            this.user_created = response?.created;
            this.user_id = response?.user_id;
            localStorage.setItem('user_name', this.user_name);
            localStorage.setItem('user_created', this.user_created);
            localStorage.setItem('user_id', this.user_id);
          })
          .catch((error) => {
            console.log('error', error);
          });
    },
    resetPassword() {
      this.authorization_error = false;
      this.resetLoading = true;
      fetch(`api/v1/auth/forgot_password?email=${this.form.resetEmail}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
          .then((response) => {
            this.resetLoading = false;
            if (response.status == 200) {
              this.resetSuccess = true;
            } else {
              this.authorization_error = true;
              this.authorization_error_text = 'Произошла ошибка.';
            }
          })
          .catch((error) => {
            this.resetLoading = false;
            console.log('error', error);
          });
    }
  },
  computed: {
    formIsEmpty() {
      return this.form.email.length < 3 || this.form.password.length < 8;
    },
    email_error() {
      let regex = /\S+@\S+\.\S+/;
      return !regex.test(this.form.email);
    },
    password_error() {
      return this.form.password.length < 8;
    }
  }
};
</script>

<style>
.email.error,
.password.error {
  border-color: red !important;
  margin-bottom: 0 !important;
}

.authorization_error {
  border: 1px solid red;
  border-radius: 3px;
  background: #f1f4f9;
  height: 35px;
  justify-content: center !important;
  color: red;
  margin: 10px 15px 0 15px;
}
</style>
