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
          <button
              v-if="user_balance < temp_price"
              class="add-item confirm"
              style="cursor: pointer"
              @click="router.push('/payment')"
          >
            Пополнить баланс
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
          <input type="checkbox" class="chbox" v-model="chbox.mentions" disabled/>
          <small
              class="prompt-hover"
          >
            Поиск упоминаний email на сайтах,<br> проиндексированных поисковыми системами.
          </small>
          <span style="user-select: none"
          >Упоминания: <span class="checkbox-price">{{ chbox_prices.mentions }} ₽</span></span
          >
        </label>
        <label class="flex items-center parent-prompt-hover">
          <input type="checkbox" class="chbox" disabled v-model="chbox.searchAccounts"/>
          <small
              class="prompt-hover"
          >
            Функция в разработке
          </small>
          <span style="user-select: none" class="checkbox-disabled">
                        Аккаунты
                    </span>
        </label>
        <button
            class="btn"
            style="white-space: nowrap;"
            @click="getPrice()"
            :disabled="!chbox.mentions"
        >
          Отправить запрос
        </button>
      </div>
      <div style="margin: auto;max-width: 900px;">
        <small v-if="!chbox.mentions" style="color: #ec5e5e;">
          Должен быть выбран хотя бы один чекбокс
        </small>
      </div>
    </div>


    <div
        class="flex items-center justify-between message--warning"
        style="display: flex; justify-content: center; align-items: center; background: white;"
    >
      <i
          class="fa fa-exclamation-circle"
          aria-hidden="true"
          style="margin-right: 4px; padding-top: 2px;"
      ></i>
      Важно! Все запросы автоматически удаляются спустя 2 часа после скачивания/просмотра.
    </div>
    <div
        v-if="query_list.length"
        class="items head-item"
    >
      <div class="item select-none" style="height: 35px">
        <div class="item__header item-title">Почта</div>
        <div class="item__header item-date" style="">Дата</div>
        <div class="item__header item-price" style="">Стоимость</div>
        <div class="item__header item__control" style="width: 260px;"></div>
        <div class="item__header delete-icon"></div>
      </div>
    </div>
    <div class="items">
      <div class="item" v-for="query in query_list" :key="query.query_id">
        <div
            class="item__content item__content-title item-title"
        >
          {{ query.query_title }}
        </div>
        <div class="item__content item-date">
          {{ getItemDate(new Date(query?.query_created_at)) }}
        </div>
        <div class="item__content item-price">
          {{ query.balance }} руб.
        </div>
        <div
            v-if="query.query_status == 'pending'"
            class="item__content"
            style="height: 30px;position: relative; pointer-events: none; width: 260px;"
        >
          <button
              class="item-btn btn"
              style="width: 130px; background: #A4CFFA;color: #333;"
          >
            Выполняется
          </button>
        </div>
        <i class="item__content fa-solid fa-circle-exclamation" v-else-if="query.query_status == 'xmlriver on update'"
           :title="'Сервис на обновлении!\n\nПопробуйте позже.'"
           style="font-size: 17px;color: #ec5e5e; width: 260px;"></i>
        <i class="item__content fa-solid fa-circle-exclamation" v-else-if="query.query_status == 'failed'"
           :title="'Ошибка сервера!\n\nПопробуйте позже.'"
           style="font-size: 17px;color: #ec5e5e; width: 260px;"></i>
        <div
            v-else
            class="item__content"
            style="width: 260px; display: flex; gap: 5px; justify-content: center;"
        >
          <button
              class="item-btn btn"
              style="width: 125px;"
              @click="goToQueryPage(query)"
          >
            Посмотреть
          </button>
          <button
              class="item-btn btn"
              style="width: 125px;"
              @click="downloadQuery(query.query_title, query.query_id, query)"
          >
            Скачать
            <i
                v-show="query.downloading"
                class="fa-solid fa-spinner"
                style="margin-left: 5px;"
            ></i>
          </button>
        </div>
        <i
            class="item__content fa-solid fa-trash delete-icon"
            style="cursor: pointer"
            @click="deleteQuery(query.query_id, update_current_timestamp)"
        ></i>
      </div>
      <div class="item" v-show="query_list_loading"
           style="background-color: transparent;justify-content: center;margin-top: 0;">
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
import {onMounted, reactive, ref, watch} from 'vue';
import '../utils/index';
import {isAuthorized, user_balance} from '../use/index';
import VPagination from './UI/VPagination.vue';
import {events} from '../utils/notification';
import router from '../router/router.js';
import {useQueryManagement} from '../composables/useQueryManagement.js';
import {usePagination} from '../composables/usePagination.js';
import {useTimestamp} from '../composables/useTimestamp.js';
import {getItemDate} from '../utils/dateUtils.js';
import {clearCheckboxes, clearKeysList} from '../utils/fieldUtils.js';

const confirm_model = ref(false);

const {
  query_list,
  query_list_loading,
  news_count,
  getUserQueries,
  getUserQueriesCount,
  deleteQuery,
  downloadQuery
} = useQueryManagement('email');
const {selected_page, set_selected_page} = usePagination();
const {update_current_timestamp} = useTimestamp();
const temp_price = ref(0);

const chbox = reactive({
  mentions: true,
  'acc search': false,
  'acc search premium': false,
  'fitness tracker': false,
  'acc checker': false,
  searchAccounts: false
});

const chbox_prices = {
  mentions: 5,
  'acc search': 120,
  'acc search premium': 120,
  'fitness tracker': 25,
  'acc checker': 130
};

const form = reactive({
  email: '',
  search_name: '',
  search_patronymic: ''
});

const error_model = ref(false);
const surname_error = ref(false);
const name_error = ref(false);
const patronymic_error = ref(false);


const getPrice = () => {
  if (surname_error.value || form.email == '') {
    error_model.value = true;
    return;
  }

  temp_price.value = Object.keys(chbox)
      .filter(item => chbox[item])
      .reduce((prev, item) => (prev + chbox_prices[item]), 0);
  if (isNaN(temp_price.value)) {
    temp_price.value = 0;
  }

  confirm_model.value = true;
};

const inputEmail = (event) => {
  let regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');

  surname_error.value = true;
  if (regex.test(event.target.value)) {
    surname_error.value = false;
  }
  form.email = event.target.value;
};

const goToQueryPage = (query) => {
  if (query?.query_status === 'done') {
    window.open(`/query?result_id=${query.query_id}&query_type=email&result_title=${query.query_title}`, '_blank');
  }
}

const multiInput = (event) => {
  if (event.ctrlKey && event.code == 'KeyV') {
    form.email = '';
    setTimeout(() => {
      let full_name = form.email.split(' ').filter(str => str != '');
      form.email = full_name[0] ?? '';
      form.search_name = full_name[1] ?? '';
      form.search_patronymic = full_name[2] ?? '';
    }, 5);
  }
};

const clearAllFields = () => {
  form.email = '';
  form.search_name = '';
  form.search_patronymic = '';
  clearKeysList();
  clearCheckboxes(chbox, {mentions: true});
};

const getHTMLPage = () => {
  confirm_model.value = false;
  surname_error.value = form.email == '';
  if (
      form.email != ''
  ) {
    const query_data = {
      email: form.email.trim(),
      methods_type: Object.keys(chbox).filter(temp_chbox => chbox[temp_chbox])
    };
    clearAllFields();

    query_list.value.unshift({
      'query_title': `${query_data.email}`,
      'query_unix_date': '1980/01/01 00:00:00',
      'old_query_unix_date': '1980/01/01 00:00:00',
      'query_created_at': new Date().format('Y-m-d h:i:s'),
      query_status: 'pending'
    });
    temp_price.value = 0;

    query_list.value = query_list.value.slice(0, 20);

    let temp_query = query_list.value[0];

    getUserQueriesCount();

    fetch(`/api/queries/find_by_email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(query_data)
    })
        .then((response) => {
          if (response?.status == 401) {
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

.checkbox-disabled {
  opacity: .5;
}

.item__content {
  width: 130px;
  height: 17px;
  display: flex;
  align-items: center;
  text-align: center;
  justify-content: center;
}

.item__header {
  width: 130px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-icon {
  width: 32px;
}

.item-title {
  width: 280px;
}

.item__content-title {
  display: inline-block;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.download {
  width: 130px;
}

.message--warning {
  max-width: 900px;
  border: 1px solid orange;
  border-radius: 3px;
  text-align: center;
  justify-content: center !important;
  color: orange;
  margin: 15px auto 0;
  padding: 3px;
}
</style>
