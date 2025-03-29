<template>
    <div class="content">
         <div class="form" style="padding: 15px 25px !important;margin-bottom: 15px;">
            <ul>
                <li>Выполнение некоторых запросов требует времени. Активируйте наш Telegram-бот для получения уведомлений о завершении обработки запросов.</li>
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
                <a href="https://t.me/pss_notification_bot" target="_blank" class="nav-link">
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
            <div class="inputs">
                <div class="flex flex-col w-full parent-prompt top-input">
                    <input v-model="form.search_surname" type="text" title="some title ..."
                        style="margin-right:0;margin-bottom: 0;" placeholder="Старый пароль">
                    <small class="prompt">Введите свой настояший пароль</small>
                </div>
                <div class="flex flex-col w-full parent-prompt top-input"
                    style="margin-right: 20px;margin-bottom: 0;align-items: start;">
                    <input style="margin-right:0;margin-bottom: 0;" v-model="form.search_name" type="text"
                        placeholder="Новый пароль">
                    <small class="prompt">Создайте новый пароль</small>
                </div>
                <div class="flex flex-col w-full parent-prompt top-input" style="margin-bottom: 0;align-items: start;">
                    <input style="margin-right:0;margin-bottom: 0;" v-model="form.search_patronymic" type="text"
                        placeholder="Повторить новый пароль">
                    <small class="prompt">Повторите новый пароль для подтверждения</small>
                </div>
            </div>
            <button class="btn password-btn">Сменить пароль</button>
        </div>

        <!--<div class="items head-item">
            <div class="item" style="height: 35px;">
                <div class="item-title">ФИО</div>
                <div class="btn-wrap">
                    <div class="item-price">Баланс</div>
                    <div class="item-death-time">Время жизни</div>
                    <button class="item-btn btn" style="opacity: 0;">Скачать</button>
                </div>
            </div>
        </div>



        <div class="items">
            <div class="item">
                <div class="item-title">Копылов Егор Агафонович</div>
                <div class="btn-wrap">
                    <div class="item-price">17 руб.</div>
                    <div class="item-death-time">17:24</div>
                    <button class="item-btn btn">Скачать</button>
                </div>
            </div>
            <div class="item">
                <div class="item-title">Гуляев Архип Лукьевич</div>
                <div class="btn-wrap">
                    <div class="item-price">20 руб.</div>
                    <div class="item-death-time">17:26</div>
                    <button class="item-btn btn">Скачать</button>
                </div>
            </div>
            <div class="item">
                <div class="item-title">Егоров Филипп Михаилович</div>
                <div class="btn-wrap">
                    <div class="item-price">13 руб.</div>
                    <div class="item-death-time">19:02</div>
                    <button class="item-btn btn">Скачать</button>
                </div>
            </div>
        </div>-->
    </div>
</template>

<script>
import axios from 'axios';
import { isAuthorized } from '../use/index'


export default {
    setup() {
        return { isAuthorized }
    },
    data() {
        return {
            prohibited_model: false,
            prohibited_site: '',
            prohibited_sites: [
            ],

            keywords_model: false,
            keyword: '',
            keywords: [
            ],

            form: {
                search_surname: '',
                search_name: '',
                search_patronymic: '',
            }
        }
    },
    methods: {
        hasSpaceOrСomma(text) {
            return text.includes(' ') || text.includes(',')
        },
        addProhibitedSite() {
            if (this.prohibited_site && this.prohibited_sites.find(site => site == this.prohibited_site) == undefined) this.prohibited_sites.push(this.prohibited_site)
            this.prohibited_site = '';
            this.prohibited_model = true
        },
        removeSite(site) {
            this.prohibited_sites = this.prohibited_sites.filter(temp_site => temp_site != site)
            if (this.prohibited_sites.length == 0) this.prohibited_model = false
        },
        addKeywords() {
            if (this.keyword && this.keywords.find(key => key == this.keyword) == undefined) this.keywords.push(this.keyword)
            this.keyword = '';
            this.keywords_model = true
        },
        removeKey(key) {
            this.keywords = this.keywords.filter(temp_key => temp_key != key)
            if (this.keywords.length == 0) this.keywords_model = false
        },
        getHTMLPage() {
            if (
                this.form.search_surname != '' &&
                this.form.search_name != '' &&
                this.form.search_patronymic != '' // &&
                //this.prohibited_sites.length &&
                //this.keywords.length
            ) {

                fetch(`/api/find_by_name`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        search_surname: this.form.search_surname,
                        search_name: this.form.search_name,
                        search_patronymic: this.form.search_patronymic,
                        prohibited_sites: this.prohibited_sites.join(', '),
                        keywords: this.keywords.join(', '),
                        search_plus: '',
                        search_minus: '',
                    }),
                })
                    .then((response) => {
                        if (response?.status == 401) {
                            this.isAuthorized = false
                            this.$router.push('login')
                            return;
                        }

                        return response.blob()
                    })
                    .then((response) => {

                        let blob = new Blob([response]);
                        let link = document.createElement("a");
                        link.href = window.URL.createObjectURL(blob);
                        link.download = `${this.form.search_surname}_${this.form.search_name}_${this.form.search_patronymic}.html`;

                        link.click();
                    })
                    .catch((error) => {
                        console.log('error', error);
                    })
            }
        },
    },
}

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

.info {
    display: flex;
    justify-content: space-around;
    max-width: 700px;
    margin: auto;
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

.form {
    padding: 15px;
    background: white;
    margin: auto;
    margin-top: 15px;
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

.btn-gray-bg {
    background: #cccccc !important;
    cursor: default !important;
}


.form .btn {
    margin-top: 10px;
    margin-left: auto !important;
    font-size: 13px;
    border: none;
    height: 30px;
}

.form ul {list-style: none}
.form li:not(.form li:last-child) {
    margin-bottom: 0.5em;
}
.form li::before {
  content: "\2022";  /* Add content: \2022 is the CSS Code/unicode for a bullet */
  color: rgb(26, 179, 148); /* Change the color */
  font-weight: bold; /* If you want it to be bold */
  display: inline-block; /* Needed to add space between the bullet and the text */
  width: 1em; /* Also needed for space (tweak if needed) */
  margin-left: -1em; /* Also needed for space (tweak if needed) */
}

.password-btn {
    margin-right: 20px;
}

.items {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 900px;
    margin: auto;
}

.head-item .item {
    font-size: 16px;
    font-weight: 600;
}

.item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: white;
    height: 45px;
    padding: 0 15px;
    margin-top: 15px;
    border-radius: 5px;
    line-height: 1.1;
    font-size: 14px;
}

.item-btn {
    background: rgb(26, 179, 148);
    font-size: 13px;
    border: none;
    height: 30px;
}

.item-btn:hover {
    background: rgb(22, 144, 119);
}

.btn-wrap {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 60%;
}

.prohibited_sites::-webkit-scrollbar {
    width: 7px;
    margin-left: 2px;
}

.prohibited_sites::-webkit-scrollbar-track {
    margin-left: 2px;
    background-color: transparent;
}

.prohibited_sites::-webkit-scrollbar-thumb {
    /*background-color: #eaeaea;*/
    background-color: rgb(170, 227, 255);
    border-radius: 5px;
}

.prohibited_sites::-webkit-scrollbar-thumb:hover {
    /*background-color: #d7d7d7;*/
    background-color: rgb(109, 166, 221);
}

.prohibited_sites {
    position: absolute;
    z-index: 1;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 7px;
    overflow: hidden;
    overflow-y: scroll;
    max-height: 200px;
    background: white;
    border: 1px solid #dadde1;
    border-radius: 3px;
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

.parent-prompt input:focus+.prompt {
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


.add-item {
    background: rgb(26, 179, 148);
    font-size: 13px;
    border: none;
    height: 30px;
    transition: .15s;
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


</style>