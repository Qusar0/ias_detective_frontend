<template>
    <div class="form">
        <label>
            <div>Почта</div>
            <input type="email" placeholder="Ваш email" :class="{
                'email': true,
                error: email_error && validation_error
            }" v-model="form.email">
            <small v-show="email_error && validation_error" style="color: red;margin-bottom: 15px;display: block;">Не
                правильный Email</small>
        </label>
        <label>
            <div>Логин</div>
            <input type="text" placeholder="Ваш логин" :class="{
                'login': true,
                error: login_error && validation_error
            }" v-model="form.login">
            <small v-show="login_error && validation_error" style="color: red;margin-bottom: 15px;display: block;">Логин не
                менее 3 символов</small>
        </label>
        <label>
            <div>Пароль</div>
            <input type="password" placeholder="Ваш пароль" :class="{
                'password': true,
                error: password_error && validation_error
            }" v-model="form.password">
            <small v-show="password_error && validation_error" style="color: red;margin-bottom: 15px;display: block;">Пароль
                не менее 8 символов</small>
        </label>
        <label>
            <div>Подтвердите пароль</div>
            <input type="password" placeholder="Подтвердите пароль" :class="{
                'password-confirm': true,
                error: password_confirm_error && validation_error
            }" v-model="form.confirm_password">
            <small v-show="password_confirm_error && validation_error"
                style="color: red;margin-bottom: 15px;display: block;">Пароли не совпадают</small>
        </label>
        <div class="flex items-center justify-between">
            <label></label>
            <button class="btn" :class="{
                disabled: !formIsEmpty && validation_error
            }" :disabled="!formIsEmpty && validation_error" @click="register">Войти</button>
        </div>
        <div class="flex items-center justify-between registration_error" v-show="registration_error">
            {{ registration_error_text }}
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
                login: '',
                email: '',
                password: '',
                confirm_password: '',
            },
            registration_error: false,

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
                    username: this.form.login,
                    email: this.form.email,
                    password: this.form.password,
                }),
            }).then((response) => {
                if (response.status == 200) {
                    //this.isAuthorized = true
                    //this.$router.push('/')
                    this.bool = true
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
            return regex.test(this.form.email) && this.form.login.length >= 3 && this.form.password.length >= 8 && this.form.password === this.form.confirm_password
        },
        email_error() {
            let regex = /\S+@\S+\.\S+/;
            return !regex.test(this.form.email);
        },
        login_error() {
            return this.form.login.length < 3;
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
.login.error,
.password.error,
.password-confirm.error {
    border-color: red !important;
    margin-bottom: 0 !important;
}

.registration_error {
    border: 1px solid red;
    border-radius: 3px;
    background: #f1f4f9;
    height: 35px;
    justify-content: center !important;
    color: red;
    margin: 10px 15px 0 15px;
}
</style>
