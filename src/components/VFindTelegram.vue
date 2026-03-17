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

    <div class="form" style="padding: 15px 25px !important;margin-bottom: 15px;">
      <ul>
        <li>Тарифицируются только те запросы, по которым был получен непустой результат. К примеру, если запрошены
          интересы, изменение профиля и телефон, а в системе оказались только интересы, то списано будет 65
          рублей.
        </li>
      </ul>
    </div>
    <div class="form">
      <div class="inputs">
        <label class="flex flex-col w-full parent-prompt top-input" style="margin-right: 20px;">
          <input
              v-model="form.tg_username" type="tel" title="some title ..."
              style="margin-right: 0; margin-bottom: 0" placeholder="Введите имя telegram пользователя" :class="{
                            'border-color-red':
                                surname_error,
                        }"
          />
          <small
              class="prompt" :class="{
                        'bg-red':
                            surname_error,
                    }"
          >Введите имя telegram пользователя</small>
        </label>
        <label class="flex flex-col w-full parent-prompt top-input" style="margin-right: 0;">
          <input
              v-model="form.tg_id" type="tel" title="some title ..." style="margin-right: 0; margin-bottom: 0"
              placeholder="Введите Telegram ID пользователя" :class="{
                            'border-color-red':
                                surname_error,
                        }"
          />
          <small
              class="prompt" :class="{
                        'bg-red':
                            surname_error,
                    }"
          >Введите Telegram ID пользователя</small>
        </label>

      </div>
      <div class="flex items-center justify-between" style="height: 30px">
        <label class="flex items-center parent-prompt-hover">
          <input type="checkbox" class="chbox" v-model="chbox.interests"/>
          <small class="prompt-hover">Категории интересов пользователя на основе<br> анализа групп, в которых он
            был замечен.</small>
          <span style="user-select: none">Интересы: <span class="checkbox-price">{{ chbox_prices.interests }}
                            ₽</span></span>
        </label>
        <label class="flex items-center parent-prompt-hover">
          <input type="checkbox" class="chbox" v-model="chbox.groups_1"/>
          <small class="prompt-hover">Список групп, в которых был<br> замечен пользователь. Источник № 1.</small>
          <span style="user-select: none">Группы №1: <span class="checkbox-price">{{ chbox_prices.groups_1 }}
                            ₽</span></span>
        </label>
        <label class="flex items-center parent-prompt-hover">
          <input type="checkbox" class="chbox" v-model="chbox.groups_2"/>
          <small class="prompt-hover">Список групп, в которых был<br> замечен пользователь. Источник № 2.</small>
          <span style="user-select: none">Группы №2: <span class="checkbox-price">{{ chbox_prices.groups_2 }}
                            ₽</span></span>
        </label>
        <label class="flex items-center parent-prompt-hover">
          <input type="checkbox" class="chbox" v-model="chbox.profile_history"/>
          <small class="prompt-hover">Список изменений профиля<br> пользователя (имя, фамилия, username)</small>
          <span style="user-select: none">История профиля: <span class="checkbox-price">{{
              chbox_prices.profile_history
            }} ₽</span></span>
        </label>
        <label class="flex items-center parent-prompt-hover">
          <input type="checkbox" class="chbox" v-model="chbox.phone_number"/>
          <small class="prompt-hover">Найти привязанный номер телефона.</small>
          <span style="user-select: none">Телефон: <span class="checkbox-price">{{ chbox_prices.phone_number }}
                            ₽</span></span>
        </label>
        <label class="flex items-center parent-prompt-hover" style="cursor: not-allowed;">
          <input type="checkbox" class="chbox" v-model="chbox.use_yandex" disabled style="opacity: 0.4;"/>
          <small class="prompt-hover">
            Временно недоступно
          </small>
          <span style="user-select: none; opacity: 0.4;">
                  Yandex
                </span>
        </label>
      </div>
      <button
          class="btn" style="white-space: nowrap;margin-top: 10px;margin-left: auto !important;"
          @click="getPrice()"
      >
        Отправить запрос
      </button>
    </div>


    <div
        v-if="query_list.length"
        class="items head-item"
    >
      <div class="item select-none" style="height: 35px">
        <div class="item__header item-title">Telegram</div>
        <div class="item__header item-date" style="">Дата</div>
        <div class="item__header item-price" style="">Стоимость</div>
        <div class="item__header item__control"></div>
        <div class="item__header delete-icon"></div>
      </div>
    </div>


    <div class="items">
      <div class="item" v-for="query in query_list" :key="query.query_id">
        <div class="item__content-title item-title">{{ query.query_title }}</div>
        <div class="btn-wrap">
          <div class="item-date">
            {{ getItemDate(new Date(query?.query_created_at)) }}
          </div>
          <div class="item-price">
            {{ query.balance }} руб.
          </div>
          <i class="fa-solid fa-spinner" v-if="query.query_status == 'pending'"></i>
          <i
              class="fa-solid fa-circle-exclamation" v-else-if="query.query_status == 'xmlriver on update'"
              :title="'Сервис на обновлении!\n\nПопробуйте позже.'"
              style="font-size: 17px;color: #ec5e5e;margin-left: 57.36px;"
          ></i>
          <i
              class="fa-solid fa-circle-exclamation" v-else-if="query.query_status == 'failed'"
              :title="'Ошибка сервера!\n\nПопробуйте позже.'"
              style="font-size: 17px;color: #ec5e5e;margin-left: 57.36px;"
          ></i>
          <button
              v-else class="item-btn btn"
              @click="downloadQuery(query.query_title, query.query_id, query)"
          >Скачать <i
              class="fa-solid fa-spinner" v-show="query.downloading" style="margin-left: 5px;"
          ></i></button>
          <i
              class="fa-solid fa-trash delete-icon"
              style="cursor: pointer"
              @click="deleteQuery(query.query_id, update_current_timestamp)"
          ></i>
        </div>
      </div>
      <div
          class="item" v-show="query_list_loading"
          style="background-color: transparent;justify-content: center;margin-top: 0;"
      >
        <i class="fa-solid fa-spinner"></i>
      </div>
    </div>

    <div
        v-if="query_list.length"
        style="max-width: 900px;margin: 15px auto 0;display: flex;"
    >
      <v-pagination
          :selected_page="selected_page"
          :general_count="news_count"
          :set_selected_page="set_selected_page"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue';
import '../utils/index';
import { isAuthorized, user_balance } from '../use/index';
import VPagination from './UI/VPagination.vue';
import { events } from '../utils/notification';
import router from '../router/router.js';
import { useQueryManagement } from '../composables/useQueryManagement.js';
import { usePagination } from '../composables/usePagination.js';
import { useTimestamp } from '../composables/useTimestamp.js';
import { getItemDate } from '../utils/dateUtils.js';
import { clearCheckboxes, clearKeysList } from '../utils/fieldUtils.js';

const confirm_model = ref(false);

const {
  query_list,
  query_list_loading,
  news_count,
  getUserQueries,
  getUserQueriesCount,
  deleteQuery,
  downloadQuery
} = useQueryManagement('telegram');
const {selected_page, set_selected_page} = usePagination();
const {update_current_timestamp} = useTimestamp();
const temp_price = ref(0);

const chbox = reactive({
  use_yandex: false,
  interests: false,
  groups_1: false,
  groups_2: false,
  profile_history: false,
  phone_number: false
});

const chbox_prices = {
  interests: 65,
  groups_1: 100,
  groups_2: 60,
  profile_history: 100,
  phone_number: 500
};

const form = reactive({
  tg_username: '',
  tg_id: '',
  search_patronymic: ''
});

const surname_error = ref(false);

const getPrice = () => {
  surname_error.value = form.tg_username === '' && form.tg_id === '';
  if (surname_error.value) return;

  temp_price.value = Object.keys(chbox)
      .filter(item => chbox[item])
      .reduce((prev, item) => (prev + chbox_prices[item]), 0);
  if (isNaN(temp_price.value)) {
    temp_price.value = 0;
  }

  confirm_model.value = true;
};

const clearAllFields = () => {
  form.tg_username = '';
  form.tg_id = '';
  form.search_patronymic = '';
  clearKeysList();
  clearCheckboxes(chbox);
};

const getHTMLPage = () => {
  confirm_model.value = false;
  surname_error.value = form.tg_username === '' && form.tg_id === '';
  if (
      form.tg_username !== '' || form.tg_id !== ''
  ) {
    const query_data = {
      use_yandex: chbox.use_yandex,
      username: form.tg_username.trim(),
      user_id: form.tg_id.trim(),
      methods_type: Object.keys(chbox).filter(temp_chbox => chbox[temp_chbox])
    };
    clearAllFields();

    query_list.value.unshift({
      'query_title': `${query_data.username ? query_data.username : query_data.user_id}`,
      'query_unix_date': '1980/01/01 00:00:00',
      'old_query_unix_date': '1980/01/01 00:00:00',
      'query_created_at': new Date().format('Y-m-d h:i:s'),
      query_status: 'pending'
    });
    temp_price.value = 0;

    query_list.value = query_list.value.slice(0, 20);

    let temp_query = query_list.value[0];

    getUserQueriesCount();

    fetch(`/api/queries/find_by_telegram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(query_data)
    })
        .then((response) => {
          if (response?.status === 401) {
            isAuthorized.value = false;
            router.push('login');
            return;
          }

          return response.json();
        })
        .then((response) => {
          temp_query.query_id = response.query_id;
          temp_query.query_status = response.query_status;
        })
        .catch((error) => {
          console.log('error', error);
        });

  }
};

watch(selected_page, (page) => {
  query_list_loading.value = true;
  query_list.value = [];
  getUserQueries(page);
});

watch(events, () => {
  getUserQueries(selected_page.value);
}, {deep: true});

onMounted(() => {
  query_list_loading.value = true;
  getUserQueriesCount();
  getUserQueries();
  update_current_timestamp();
});

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

.form .btn {
  margin-top: 10px;
  margin-left: auto !important;
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
  display: flex;
  justify-content: center;
  align-items: center;
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

.checkbox-price {
  color: white;
  background: gold;
  padding: 1px 2px 1px 3px;
  font-size: 11px;
  border-radius: 3px;
}

.item__header {
  width: 130px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-icon {
  width: 16px;
}

.item-title {
  width: 170px;
}

.item__content-title {
  display: inline-block;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
</style>
