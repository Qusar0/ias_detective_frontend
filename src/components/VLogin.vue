<template>
    <div class="form" @keydown.enter="login">
        <label>
            <div>Логин</div>
            <input type="text" placeholder="Ваш логин" class="login" :class="{
                error: login_error && validation_error
            }" v-model="form.login">
            <small v-show="login_error && validation_error" style="color: red;margin-bottom: 15px;display: block;">Логин не
                менее 3 символов</small>
        </label>
        <label>
            <div>Пароль</div>
            <input type="password" placeholder="Ваш пароль" class="password" :class="{
                error: password_error && validation_error
            }" v-model="form.password">
            <small v-show="password_error && validation_error" style="color: red;margin-bottom: 15px;display: block;">Пароль
                не менее 8 символов</small>
        </label>
        <div class="flex items-center justify-between">
            <label class="remember-me">
                <input type="checkbox" v-model="form.checked"> - Запомнить меня
            </label>
            <button class="btn" :class="{
                disabled: formIsEmpty && validation_error
            }" :disabled="formIsEmpty && validation_error" @click="login">Войти</button>
        </div>
        <div class="flex items-center justify-between authorization_error" v-show="authorization_error">
            {{ authorization_error_text }}
        </div>
    </div>
</template>

<script>
import { isAuthorized, user_name, user_created, user_id } from '../use/index'
import { get_events } from "../utils/notification"

export default {
    data() {
        return {
            form: {
                login: '',
                password: '',
                checked: true,
            },
            authorization_error: false,
            authorization_error_text: '«Неправильный логин или пароль»',
            validation_error: false
        }
    },
    setup() {
        return { isAuthorized, user_name, user_created, get_events, user_id }
    },
    methods: {
        login() {
            if (this.formIsEmpty) {
                this.validation_error = true
                return
            }

            fetch(`/api/v1/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    username: this.form.login,
                    password: this.form.password,
                }),
            })
                .then((response) => {
                    if (response.status == 200) {

                        this.isAuthorized = true
                        //this.user_name = response?.body?.name
                        this.get_events()
                        this.$router.push('/')
                        return response?.json();
                    }
                    else if (response.status == 409) {
                        this.authorization_error = true
                        this.authorization_error_text = '«Такого пользователя не существует»'
                    }
                    else if (response.status == 401) {
                        this.authorization_error = true
                        this.authorization_error_text = '«Неправильный логин или пароль»'
                    }
                    this.validation_error = true
                })
                .then((response) => {
                    this.user_name = response?.name
                    this.user_created = response?.created
                    this.user_id = response?.user_id
                    localStorage.setItem('user_name', this.user_name)
                    localStorage.setItem('user_created', this.user_created)
                    localStorage.setItem('user_id', this.user_id)
                })
                .catch((error) => {
                    console.log('error', error);
                })
        }
    },
    computed: {
        formIsEmpty() {
            return this.form.login.length < 3 || this.form.password.length < 8
        },
        login_error() {
            return this.form.login.length < 3
        },
        password_error() {
            return this.form.password.length < 8
        },
    },
}
</script>

<style>
.login.error,
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
