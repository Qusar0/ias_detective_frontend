<template>
    <div class="form">
        <label>
            <div>Почта</div>
            <input
                v-model="form.email"
                type="email"
                placeholder="Ваш email"
                :class="{ 'email': true, error: email_error && validation_error }"
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
                :class="{ 'password': true, error: password_error && validation_error }"
            >
            <small
                v-show="password_error && validation_error"
                style="color: red;margin-bottom: 15px;display: block;"
            >
              Пароль не менее 8 символов
            </small>
        </label>
        <label>
            <div>Подтвердите пароль</div>
            <input
                v-model="form.confirm_password"
                type="password"
                placeholder="Подтвердите пароль"
                :class="{ 'password-confirm': true, error: password_confirm_error && validation_error }"
            >
            <small
                v-show="password_confirm_error && validation_error"
                style="color: red;margin-bottom: 15px;display: block;"
            >
              Пароли не совпадают
            </small>
        </label>
        <div class="flex items-center justify-between">
            <label></label>
            <button
                class="btn"
                :class="{ disabled: !formIsEmpty && validation_error }"
                :disabled="!formIsEmpty && validation_error"
                @click="register"
            >
              Войти
            </button>
        </div>
        <div
            v-show="registration_error"
            class="flex items-center justify-between registration_error"
        >
            {{ registration_error_text }}
        </div>
      <div
          v-show="registration_success"
          class="flex items-center justify-between registration_success"
      >
        Вы зарегистрированы, письмо с подтверждением отправлено на вашу почту
      </div>
    </div>
</template>

<script>
import axios from 'axios'
import { isAuthorized } from '../use/index'
import { bool } from '../use/index'

export default {
    setup() {
        return { bool, isAuthorized }
    },
    data() {
        return {
            form: {
                email: '',
                password: '',
                confirm_password: '',
            },
            registration_error: false,
          registration_success: false,
            validation_error: false,
            registration_error_text: '',
        }
    },
    methods: {
        register() {

            if (!this.formIsEmpty) {
                this.validation_error = true
                return;
            }

            fetch(`/api/v1/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    email: this.form.email,
                    password: this.form.password,
                }),
            }).then((response) => {
                if (response.status == 200) {
                    //this.isAuthorized = true
                    //this.$router.push('/')
                  this.registration_success = true;
                  setTimeout(() => {
                    this.bool = true
                    this.registration_success = false
                  }, 3000);
                    return;
                }
                else if (response.status == 409) {
                    this.registration_error = true
                    this.registration_error_text = 'Такой пользователь уже существует!'
                }
                this.validation_error = true
            })
                .catch((error) => {
                    console.log('error', error);
                })
        }
    },
    computed: {
        formIsEmpty() {
            let regex = /\S+@\S+\.\S+/;
            return regex.test(this.form.email) && this.form.password.length >= 8 && this.form.password === this.form.confirm_password
        },
        email_error() {
            let regex = /\S+@\S+\.\S+/;
            return !regex.test(this.form.email);
        },
        password_error() {
            return this.form.password.length < 8;
        },
        password_confirm_error() {
            return this.form.password !== this.form.confirm_password;
        },
    },
}
</script>

<style>
.email.error,
.password.error,
.password-confirm.error {
    border-color: red !important;
    margin-bottom: 0 !important;
}

.registration_error {
    border: 1px solid red;
    border-radius: 3px;
    background: #f1f4f9;
  text-align: center;
    justify-content: center !important;
    color: red;
    margin: 10px 15px 0 15px;
}

.registration_success {
  border: 1px solid green;
  border-radius: 3px;
  background: #f1f4f9;
  text-align: center;
  justify-content: center !important;
  color: green;
  margin: 10px 15px 0 15px;
  padding: 3px;
}
</style>
