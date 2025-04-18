<template>
    <div class="content">
        <div class="confirm-model" v-show="confirm_model" @click="confirm_model = false">
            <div class="confirm-model_body" @click.stop>
              <div
                  v-if="user_balance >= temp_price || temp_price === 0"
                  class="title"
              >
                Вы уверены, что хотите сделать запрос за {{ temp_price }} руб. ?
              </div>
              <div
                  v-else
                  class="title"
              >
                Недостаточно средств для совершения действия
              </div>
              <div class="flex items-center">
                <button class="add-item cancel" @click="confirm_model = false">Отмена</button>
                <button
                    v-if="user_balance >= temp_price || temp_price === 0"
                    class="add-item confirm"
                    @click.stop="getHTMLPage()"
                >
                  Да
                </button>
              </div>
            </div>
        </div>
        <div class="confirm-model" v-show="error_model" @click="error_model = false">
            <div class="confirm-model_body" @click.stop>
                <div class="title" style="color: rgb(236, 94, 94);font-size: 17px;">Email указан не корректно!</div>
                <div class="flex items-center">
                    <button class="add-item cancel" @click="error_model = false">Закрыть</button>
                </div>
            </div>
        </div>

        <!-- <div class="form" style="padding: 15px 25px !important;margin-bottom: 15px;">
            <ul>
                <li>Обращаем внимание, что модуль «Утечки» не выдает содержание персональных данных, а лишь проверяет факт наличия проверяемого email в утечках и выводит их список в случае выявления.</li>
                <li>Отличие модулей «Привязки» и «Чекеры аккаунтов» состоит в том, что в первом случае мы находим ссылку на связанный аккаунт (к примеру, в социальной сети LinkedIn) либо получаем дополнительную информацию (например, маску привязанного телефона в Facebook), а во втором лишь проверяем сам факт наличия либо отсутствия аккаунта (к примеру, в Instagram).</li>
            </ul>
        </div> -->
        <div class="form">
            <div class="inputs">
                <div class="flex flex-col w-full parent-prompt top-input" style="margin-right: 0;">
                    <input
                        :value="form.email"
                        @input="inputEmail"
                        type="email"
                        title="some title ..."
                        style="margin-right: 0; margin-bottom: 0"
                        placeholder="Введите почту"
                        :class="{
                            'border-color-red':
                                surname_error,
                        }"
                        @keydown="multiInput"
                    />
                    <small
                        class="prompt"
                        :class="{
                            'bg-red':
                                surname_error,
                        }"
                        >Введите адрес электронной почты в формате name@post.com</small
                    >
                </div>
            </div>
            <div class="flex items-center justify-between" style="height: 30px">
                <label class="flex items-center parent-prompt-hover">
                    <input type="checkbox" class="chbox" v-model="chbox.mentions" />
                    <small
                        class="prompt-hover"
                    >
                        <!-- Списание стоимости запроса производится <br>вне зависимости от его результата.<br> -->
                        Поиск упоминаний email на сайтах,<br> проиндексированных поисковыми системами.
                    </small>
                    <span style="user-select: none"
                        >Упоминания: <span class="checkbox-price">{{ chbox_prices.mentions }} ₽</span></span
                    >
                </label>
                <label class="flex items-center parent-prompt-hover">
                    <input type="checkbox" class="chbox" disabled v-model="chbox.searchAccounts" />
                    <small
                        class="prompt-hover"
                    >
                        Функция в разработке
                    </small>
                    <span style="user-select: none" class="checkbox-disabled">
                        Аккаунты
                    </span>
                </label>
              <label class="flex items-center parent-prompt-hover">
                <input type="checkbox" class="chbox" v-model="chbox.use_yandex" />
                <small class="prompt-hover">
                  Использовать ПС Яндекс для поиска
                </small>
                <span style="user-select: none">
                  Yandex
                </span>
              </label>
                <!-- <label class="flex items-center parent-prompt-hover">
                    <input type="checkbox" class="chbox" v-model="chbox.leaks" />
                    <small
                        class="prompt-hover"
                        >Проверка email на предмет наличия<br> в базах утечек персональных данных.</small
                    >
                    <span style="user-select: none"
                        >Утечки: <span class="checkbox-price">{{ chbox_prices.leaks }} ₽</span></span
                    >
                </label> -->
                <!-- <label class="flex items-center parent-prompt-hover">
                    <input type="checkbox" class="chbox" v-model="chbox['acc search']" />
                    <small
                        class="prompt-hover"
                        >Поиск связанных аккаунтов<br> в соц. сетях, веб-сервисах.</small
                    >
                    <span style="user-select: none"
                        >Привязки: <span class="checkbox-price">{{ chbox_prices['acc search'] }} ₽</span></span
                    >
                </label>
                <label class="flex items-center parent-prompt-hover">
                    <input type="checkbox" class="chbox" v-model="chbox['acc search premium']" />
                    <small
                        class="prompt-hover"
                        >Поиск связанных аккаунтов<br> в соц. сетях, веб-сервисах (premium).</small
                    >
                    <span style="user-select: none"
                        >Привязки+ <span class="checkbox-price">{{ chbox_prices['acc search premium'] }} ₽</span></span
                    >
                </label> -->
                <!-- <label class="flex items-center parent-prompt-hover">
                    <input type="checkbox" class="chbox" v-model="chbox['fitness tracker']" />
                    <small
                        class="prompt-hover"
                        >Проверка наличия аккаунта<br> в сервисах фитнес-трекеров.</small
                    >
                    <span style="user-select: none"
                        >Фитнес-трекеры: <span class="checkbox-price">{{ chbox_prices['fitness tracker'] }} ₽</span></span
                    >
                </label>
                <label class="flex items-center parent-prompt-hover">
                    <input type="checkbox" class="chbox" v-model="chbox['acc checker']" />
                    <small
                        class="prompt-hover"
                        >Проверка наличия аккаунтов<br> в веб-сервисах, соц. сетях.</small
                    >
                    <span style="user-select: none"
                        >Чекеры аккаунтов: <span class="checkbox-price">{{ chbox_prices['acc checker'] }} ₽</span></span
                    >
                </label> -->
                <button class="btn" style="white-space: nowrap;" @click="getPrice()">
                    Отправить запрос
                </button>
            </div>
            <!--<div class="flex items-center">-->
                <!--<label class="flex items-center">
                    <input type="checkbox" class="chbox" v-model="chbox.default_keywords" />
                    <span style="user-select: none"
                        >стандартные ключевые слова</span
                    >
                </label>-->
            <!--</div>-->
        </div>

        <!-- <div class="items head-item">
            <div class="item select-none" style="height: 35px">
                <div class="item-title">ФИО</div>
                <div class="btn-wrap">
                    <div class="item-price">Стоимость</div>
                    <div class="item-death-time">Время до удаления</div>
                    <button class="item-btn btn" style="opacity: 0">
                        Скачать
                    </button>
                </div>
            </div>
        </div>

        <div class="items">
            <div class="item" v-for="query in query_list" :key="query.query_id">
                <div class="item-title">{{ query.query_title }}</div>
                <div class="btn-wrap">
                    <div class="item-price">17 руб.</div>
                    <div class="item-death-time">{{ getRemainingTime(query, current_timestamp) }}</div>
                    <i class="fa-solid fa-spinner" v-if="query.query_status == 'pending'"></i>
                    <button v-else class="item-btn btn" @click="downloadQuery(query.query_title, query.query_id, query)">Скачать <i class="fa-solid fa-spinner" v-show="query.downloading" style="margin-left: 5px;"></i></button>
                </div>
            </div>
            <div class="item" v-show="query_list_loading" style="background-color: transparent;justify-content: center;margin-top: 0;">
                <i class="fa-solid fa-spinner"></i>
            </div>
        </div> -->

        
        <div class="items head-item">
            <div class="item select-none" style="height: 35px">
                <div class="item-title">Почта</div>
                <div class="btn-wrap">
                    <div class="item-date" style="margin-left: 5%;">Дата</div>
                    <div class="item-price" style="margin-left: 13.5%;">Стоимость</div>
                    <div class="item-death-time">Время до удаления</div>
                    <button class="item-btn btn" style="opacity: 0">
                        Скачать
                    </button>
                </div>
            </div>
        </div>

        
        <div class="items">
            <div class="item" v-for="query in query_list" :key="query.query_id">
                <div class="item-title">{{ query.query_title }}</div>
                <div class="btn-wrap">
                    <div class="item-date">
                        {{ getItemDate(new Date(query?.query_created_at)) }}
                        <!-- 17:55, 11 Июнь -->
                    </div>
                    <div class="item-price">
                        {{ query.balance }} руб.
                    </div>
                    <div class="item-death-time">{{ getRemainingTime(query, current_timestamp) }}</div>
                    <i class="fa-solid fa-spinner" v-if="query.query_status == 'pending'"></i>
                    <i class="fa-solid fa-circle-exclamation" v-else-if="query.query_status == 'xmlriver on update'" :title="'Сервис на обновлении!\n\nПопробуйте позже.'" style="font-size: 17px;color: #ec5e5e;margin-left: 57.36px;"></i>
                    <i class="fa-solid fa-circle-exclamation" v-else-if="query.query_status == 'failed'" :title="'Ошибка сервера!\n\nПопробуйте позже.'" style="font-size: 17px;color: #ec5e5e;margin-left: 57.36px;"></i>
                    <button v-else class="item-btn btn" @click="downloadQuery(query.query_title, query.query_id, query)">Скачать <i class="fa-solid fa-spinner" v-show="query.downloading" style="margin-left: 5px;"></i></button>
                  <i
                      class="fa-solid fa-trash delete-icon"
                      @click="deleteQuery(query.query_id)"
                  ></i>
                </div>
            </div>
            <div class="item" v-show="query_list_loading" style="background-color: transparent;justify-content: center;margin-top: 0;">
                <i class="fa-solid fa-spinner"></i>
            </div>
        </div>

        <div style="max-width: 900px;margin: 15px auto 0;display: flex;">
            <v-pagination
                :selected_page="selected_page"
                :general_count="news_count"
                :set_selected_page="set_selected_page"/>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import "../utils/index";
import { isAuthorized, prohibited_model, keywords_model, keys_list, user_balance } from "../use/index";
import ListInput from './ListInput.vue'
import VPagination from './UI/VPagination.vue'
import { events } from "../utils/notification"

export default {
    setup() {
        return { isAuthorized, prohibited_model, keywords_model, keys_list, events, user_balance };
    },
    components: {
        ListInput,
        VPagination,
    },
    data() {
        return {
            query_list_loading: true,
            confirm_model: false,
            current_timestamp: new Date().valueOf(),
            query_list: [],
            prohibited_site: "",
            prohibited_sites: [],

            keyword: "",
            keywords: [],
            chbox: {
              use_yandex: false,
                mentions: false,
                // leaks: false,
                'acc search': false,
                'acc search premium': false,
                'fitness tracker': false,
                'acc checker': false,
                searchAccounts: false,
            },
            chbox_prices: {
                mentions: 5,
                // leaks: 5,
                'acc search': 120,
                'acc search premium': 120,
                'fitness tracker': 25,
                'acc checker': 130,
            },
            temp_price: 0,

            form: {
                email: "",
                search_name: "",
                search_patronymic: "",
            },
            error_model: false,
            surname_error: false,
            name_error: false,
            patronymic_error: false,
            selected_page: 1,
            news_count: 0,
        };
    },
    methods: {
        getPrice() {
            if (this.surname_error || this.form.email == '') {
                this.error_model = true
                return;
            }

            this.temp_price = Object.keys(this.chbox)
                .filter(item => this.chbox[item])
                .reduce((prev, item) => (prev + this.chbox_prices[item]), 0)
            if (isNaN(this.temp_price)) {
                this.temp_price = 0;
            }

            this.confirm_model = true;
        },
        inputEmail(event) {
            let regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');

            this.surname_error = true;
            if (regex.test(event.target.value)) {
                this.surname_error = false;
            }
            this.form.email = event.target.value;
        },
        set_selected_page(page) {
            this.query_list_loading = true;
            this.selected_page = parseInt(page);
        },
        getItemDate(date) {
            return (
                `${date.format("h:i")}, ${date.format("d.m.Y")}`
            ).trim();
        },
        getRemainingTime(query, current_timestamp) {
            const two_hours = 1000 * 60 * 60 * 2;
            const default_offset = new Date().getTimezoneOffset() * 60 * 1000;
            let result = new Date(two_hours - ((current_timestamp - query.query_unix_date.valueOf())));
            if (query?.old_query_unix_date == '1980/01/01 00:00:00') {
                return '02:00:00';
            }
            else if (result.valueOf() <= new Date(0).valueOf()) {
                let temp_delete_queries = [];
                this.query_list = this.query_list.filter(q => {
                    if (q.query_id != query.query_id) {
                        return true
                    }
                    else {
                        temp_delete_queries.push(+query.query_id)
                        return false
                    }
                });
                return '00:00:00';
            }
            else {
                return new Date(result.valueOf() + default_offset).format("h:i:s")
            }
        },
        multiInput(event) {
            if (event.ctrlKey && event.code == 'KeyV') {
                this.form.email = ''
                setTimeout(() => {
                    let full_name = this.form.email.split(' ').filter(str => str != '')
                    this.form.email = full_name[0] ?? ''
                    this.form.search_name = full_name[1] ?? ''
                    this.form.search_patronymic = full_name[2] ?? ''
                }, 5);
            }
        },
        uploadFile(event, array_name = 'prohibited_sites', modal_name = 'prohibited_model') {

            let file = event.target.files[0];

            let reader = new FileReader();

            reader.readAsText(file);

            reader.onload = () => {
                if (reader.result) this[array_name] = reader.result.trim().split(/\r?\n/).map(item => item.trim());
                this[modal_name] = true
            };

            reader.onerror = function() {
                console.log(reader.error);
            };

        },
        hasSpaceOrСomma(text) {
            return text.includes(" ") || text.includes(",");
        },
        addProhibitedSite() {
            if (
                this.prohibited_site &&
                this.prohibited_sites.find(
                    (site) => site == this.prohibited_site
                ) == undefined
            )
                this.prohibited_sites.push(this.prohibited_site);
            this.prohibited_site = "";
            this.prohibited_model = true;
        },
        removeSite(site) {
            this.prohibited_sites = this.prohibited_sites.filter(
                (temp_site) => temp_site != site
            );
            if (this.prohibited_sites.length == 0)
                this.prohibited_model = false;
        },
        addKeywords() {
            if (
                this.keyword &&
                this.keywords.find((key) => key == this.keyword) == undefined
            )
                this.keywords.push(this.keyword);
            this.keyword = "";
            this.keywords_model = true;
        },
        removeKey(key) {
            this.keywords = this.keywords.filter((temp_key) => temp_key != key);
            if (this.keywords.length == 0) this.keywords_model = false;
        },
        clearAllFields() {
            this.form.email = '';
            this.form.search_name = '';
            this.form.search_patronymic = '';
            this.keys_list.prohibited_site.list = [];
            this.keys_list.keyword.list = [];
            this.keys_list.minus.list = [];
            this.keys_list.plus.list = [];
            Object.keys(this.chbox).forEach(temp_chbox => {
                this.chbox[temp_chbox] = false;
            })
        },
        getHTMLPage() {
            this.confirm_model = false;
            this.surname_error = this.form.email == "";
            if (
                this.form.email != ""
            ) {
                const query_data = {
                  use_yandex: this.chbox.use_yandex,
                    email: this.form.email.trim(),
                    methods_type: Object.keys(this.chbox).filter(temp_chbox => this.chbox[temp_chbox])
                }
                this.clearAllFields()

                this.query_list.unshift({
                    "query_title": `${query_data.email}`,
                    "query_unix_date": "1980/01/01 00:00:00",
                    "old_query_unix_date": "1980/01/01 00:00:00",
                    "query_created_at": new Date().format('Y-m-d h:i:s'),
                    query_status: "pending",
                })
                this.temp_price = 0;

                this.query_list = this.query_list.slice(0, 20);

                let temp_query = this.query_list[0]

                this.getUserQueriesCount()

                fetch(`/api/find_by_email`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify(query_data),
                })
                    .then((response) => {
                        if (response?.status == 401) {
                            this.isAuthorized = false;
                            this.$router.push("login");
                            return;
                        }

                        return response.json();
                        //this.getUserQueries()
                    })
                    .then((response) => {
                        temp_query.query_id = response.query_id
                        temp_query.query_status = response.query_status
                    })
                    .catch((error) => {
                        console.log("error", error);
                    })

            }
        },
        getUserQueriesCount() {
            fetch(`/api/queries_count?query_category=email`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then((response) => {
                    if (response?.status == 401) {
                        this.isAuthorized = false;
                        this.$router.push("login");
                        return Promise.reject({
                            message: "Token has expired"
                        });
                    }
                    return response.json()
                })
                .then((response) => {
                    this.news_count = response;
                })
                .catch((error) => {
                    console.log("error", error);
                })
        },
      deleteQuery(id) {
        fetch(`/api/delete_query?query_id=${id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        })
            .then(() => {
              this.query_list_loading = true
              this.getUserQueriesCount()
              this.getUserQueries()
              this.update_current_timestamp()
              if (this.news_count === 1) {
                window.location.reload()
              }
            })
            .catch(() => {
              console.log('unable to delete query', id)
            });
      },
        getUserQueries(page = 1) {
            fetch(`/api/query_getter?query_category=email&page=${page - 1}`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then((response) => {
                    if (response?.status == 401) {
                        this.isAuthorized = false;
                        this.$router.push("login");
                        return Promise.reject({
                            message: "Token has expired"
                        });
                    }
                    return response.json()
                })
                .then((response) => {
                    if (response) this.query_list = response.map(query => {
                        query.old_query_unix_date = query.query_unix_date;
                        query.query_unix_date = new Date(query.query_unix_date).minus('minute', new Date(query.query_unix_date).getTimezoneOffset());
                        query.query_created_at = new Date(query.query_created_at).minus('minute', new Date(query.query_unix_date).getTimezoneOffset()).format('Y-m-d h:i:s');

                        return query
                    })
                })
                .catch((error) => {
                    console.log("error", error);
                })
                .finally(() => {
                    this.query_list_loading = false
                    
                    let hasPendingQuery = this.query_list.find(query => (query.query_status == 'pending')) !== undefined
                    if (hasPendingQuery) {
                        setTimeout(() => {
                            this.getUserQueries()
                        }, 1000 * 15);
                    }
                });
        },
        downloadQuery(title, id, query) {
            query.downloading = true
            fetch(`/api/download_query`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    query_id: id,
                }),
            })
                .then((response) => {
                    if (response?.status == 401) {
                        this.isAuthorized = false;
                        this.$router.push("login");
                        return Promise.reject({
                            message: "Token has expired"
                        });
                    }
                    return response.blob();
                })
                .then((response) => {

                    let blob = new Blob([response]);
                    let link = document.createElement("a");
                    link.href = window.URL.createObjectURL(blob);
                    link.download = `${title}.html`;

                    link.click();
                    this.getUserQueries()
                })
                .catch((error) => {
                    console.log("error", error);
                })
                .finally(() => {
                    query.downloading = false
                });
        },
        update_current_timestamp() {
            this.current_timestamp = new Date().valueOf()
            setTimeout(() => {
                this.update_current_timestamp()
            }, 1000);
        },
    },
    watch: {
        selected_page(page) {
            this.query_list = [];
            this.getUserQueries(page);
        },
        events: {
            handler() {
                this.getUserQueries(this.selected_page)
            },
            deep: true
        }
    },
    mounted() {
        this.query_list_loading = true
        this.getUserQueriesCount()
        this.getUserQueries()
        this.update_current_timestamp()
    },
};
</script>

<style scoped>
.form input[type="email"],
.form input[type="password"],
.form input[type="tel"] {
    font-size: 13px;
    background: #f1f4f9;
    height: 30px;
    padding: 0 7px;
}
.form input[type="text"] {
    height: 30px;
    padding: 0 7px;
}

.content {
    padding: 20px;
}


.form {
    padding: 15px !important;
    background: white;
    margin: auto;
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
    border: 1px solid #d9d9d9;
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
    font-size: 13px;
    border: none;
    height: 30px !important;
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
    width: 70%;
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


.top-input {
    margin-right: 20px;
    margin-bottom: 15px;
    align-items: start;
    flex-direction: column;
}

.parent-prompt {
    position: relative;
}



.add-item {
    background: rgb(26, 179, 148);
    font-size: 13px;
    border: none;
    height: 30px;
    transition: 0.15s;
}

button.add-item:hover {
    background: rgb(22, 144, 119) !important;
}

.chbox {
    height: 16px !important;
    width: 16px !important;
    margin-right: 8px !important;
    line-height: 1;
    accent-color: #404f5d;
}

.bg-red::after {
    color: red !important;
}
.bg-red {
    background: red !important;
    opacity: 1 !important;
    display: flex !important;
    z-index: 1 !important;
}
.border-color-red {
    border-color: red !important;
}


.confirm-model {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, .3);
    z-index: 10;
    user-select: none;
}
.confirm-model_body {
    padding: 12px;
    min-width: 400px;
    background: white;
    border-radius: 4px;
}
.confirm-model_body .title {
    margin-bottom: 10px;
}
.confirm-model_body .add-item.cancel {
    color: white;
    padding: 0 8px;
    margin-left: auto;
    height: 25px;
    border-radius: 4px;
    background: #b2b2b2;
}
.confirm-model_body .add-item.cancel:hover {
    background: #838383 !important;
}
.confirm-model_body .add-item.confirm {
    color: white;
    padding: 0 8px;
    margin-left: 6px;
    height: 25px;
    border-radius: 4px;
}
.fa-spinner {
    animation: loading .7s linear infinite;
}
@keyframes loading {
    from {
        transform: rotateZ(0deg);
    }
    to {
        transform: rotateZ(360deg);
    }
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

.ssss:hover .with-upload {
    left: 25px;
}
.upload-text-file {
    display: flex;
    align-items: center;
    justify-content: center;
}
.upload-text-file i {
    font-size: 20px;
    color: #404f5d;
    cursor: pointer;
    overflow: hidden;
    transition: .15s;
    width: 0;
}

.ssss:hover .upload-text-file i {
    width: 17px;
    margin-right: 8px;
}



.prompt-hover,
.prompt {
    position: absolute;
    bottom: calc(100% + 7px);
    left: 0;
    font-size: 13px;
    background: #404f5d;
    color: white;
    padding: 6px;
    border-radius: 6px;
    transition: 0.15s;
    opacity: 0;
}
.prompt-hover {
    left: -15px;
    white-space: nowrap;
}

.prompt-hover::after,
.prompt::after {
    content: "▶";
    position: absolute;
    top: 100%;
    left: 20px;
    color: #404f5d;
    height: 9px;
    transform: rotate(90deg);
}

.parent-prompt-hover {
    position: relative;
}

.parent-prompt-hover:hover ~ .prompt.with-upload {
    opacity: 0 !important;
}
.parent-prompt-hover:hover > .prompt-hover {
    opacity: 1;
    z-index: 2;
}
.parent-prompt input:focus + .prompt {
    opacity: 1;
    z-index: 2;
}
.parent-prompt-hover:not(.parent-prompt-hover:hover) > .prompt-hover {
    opacity: 0;
    display: none;
}
.parent-prompt input:not(.parent-prompt input:focus) + .prompt {
    opacity: 0;
    display: none;
}


label.parent-prompt:focus-within > .prompt {
    opacity: 1;
    z-index: 2;
}
label.parent-prompt:not(label.parent-prompt:focus-within) > .prompt {
    opacity: 0;
    display: none;
}


.select-none {
    user-select: none;
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

.checkbox-price {
    color: white;
    background: gold;
    padding: 1px 2px 1px 3px;
    font-size: 11px;
    border-radius: 3px;
}

.checkbox-disabled {
    opacity: .5;
}

.delete-icon {
  cursor: pointer;
}
</style>
