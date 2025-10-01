<template>
  <div class="content">
    <div
        v-show="confirm_model"
        class="confirm-model"
        @click="confirm_model = false"
    >
      <div
          class="confirm-model_body"
          @click.stop
      >
        <div
            v-if="temp_price > user_balance"
            class="title"
        >
          Недостаточно средств для оплаты запроса на
          <i
              v-if="temp_price == 'loading...'"
              class="fa-solid fa-spinner"
          ></i>
          <template v-else> {{ temp_price }}</template>
          руб., пополните баланс!
        </div>
        <div
            v-else
            class="title"
        >
          Вы уверены, что хотите сделать запрос за
          <i v-if="temp_price == 'loading...'" class="fa-solid fa-spinner"></i>
          <template v-else> {{ temp_price }}</template>
          руб.?
        </div>
        <div
            v-if="temp_price > user_balance"
            class="flex items-center"
        >
          <button
              class="add-item cancel"
              @click="confirm_model = false"
          >
            Отмена
          </button>
          <button
              class="add-item confirm"
              :disabled="!temp_price || temp_price == 'loading...'"
              :style="temp_price == 'loading...' ? 'background: #ccc;' : ''"
              @click="confirm_model = false; router.push('/payment')"
          >
            Пополнить баланс
          </button>
        </div>
        <div
            v-else
            class="flex items-center"
        >
          <button
              class="add-item cancel"
              @click="confirm_model = false"
          >
            Отмена
          </button>
          <button
              class="add-item confirm"
              :disabled="temp_price === 'loading...' || languageError"
              :style="temp_price === 'loading...' || languageError ? 'background: #ccc;' : ''"
              @click.stop="getHTMLPage()"
          >
            Да
          </button>
        </div>
      </div>
    </div>
    <div
        class="form"
        style="padding: 15px 25px !important;margin-bottom: 15px;"
    >
      <ul>
        <li>Обязательные поля для заполнения: Фамилия, Имя и Регионы.</li>
        <li>Регионы вводите по одному на строке, после чего нажмите Enter или
          кнопку «Выбрать» - повторите для нужного количества регионов (но учтите, что можно указать только 1-2 региона).
        </li>
      </ul>
    </div>
    <div
        style="margin: 15px auto;max-width: 900px;"
        :style="regions_error ? 'border: 1px solid red; border-radius: 5px; margin-bottom: 8px' : ''"
    >
      <multiselect
          v-model="selectedRegions"
          :options="regionsOptions"
          :multiple="true"
          :close-on-select="false"
          :limit="2"
          :limitText="count => `и еще ${count}`"
          track-by="code"
          label="name"
          placeholder="Выберите регионы (1-2)"
          selectLabel="Нажмите enter, чтобы выбрать"
          deselectLabel="Нажмите enter, чтобы удалить"
          selectedLabel="Выбрано"
          :loading="regionsLoading"
          :disabled="regionsLoading"
          :class="{ 'multiselect-error': regions_error }"
          style="margin: 0;"
      ></multiselect>
    </div>
    <div style="margin: 0 auto 10px;max-width: 900px;">
      <small v-if="regions_error" style="color: #ec5e5e;">
        Необходимо выбрать хотя бы один регион для поиска (максимум 2 региона).
      </small>
    </div>
    <div class="form">
      <div class="inputs">
        <div class="flex flex-col w-full parent-prompt top-input">
          <input
              v-model="form.search_surname"
              type="text"
              title="some title ..."
              style="margin: 0;"
              placeholder="Фамилия"
              :class="{ 'border-color-red': surname_error && form.search_surname == '', }"
              @keydown="multiInput"
          />
          <small
              class="prompt"
              :class="{ 'bg-red': surname_error && form.search_surname == '', }"
          >
            Фамилия объекта в именительном падеже. "Ё" сохранять (например: Ковалёв (а не Ковалев)
          </small>
        </div>
        <div
            class="flex flex-col w-full parent-prompt top-input"
            style="
                        margin-right: 20px;
                        margin-bottom: 15px;
                        align-items: start;
                    "
        >
          <input
              v-model="form.search_name"
              type="text"
              placeholder="Имя"
              style="margin: 0;"
              :class="{ 'border-color-red': name_error && form.search_name == '', }"
          />
          <small
              class="prompt"
              :class="{ 'bg-red': name_error && form.search_name == '', }"
          >
            Имя объекта в именительном падеже
          </small>
        </div>
        <div
            class="flex flex-col w-full parent-prompt top-input"
            style="margin-bottom: 15px;margin-right: 0;align-items: start"
        >
          <input
              v-model="form.search_patronymic"
              type="text"
              placeholder="Отчество"
              style="margin: 0;"
              :class="{ 'border-color-red': patronymic_error && form.search_patronymic == '', }"
          />
          <small
              class="prompt"
              :class="{ 'bg-red': patronymic_error && form.search_patronymic == '', }"
          >
            Отчество объекта в именительном падеже (при наличии)
          </small>
        </div>
      </div>
      <div class="inputs">
        <div class="flex flex-col w-full parent-prompt top-input">
          <input
              v-model="form.passport_series"
              type="text"
              title="some title ..."
              style="margin: 0;"
              placeholder="Серия паспорта"
              @keydown="multiInput"
          />
          <small class="prompt">
            Серия паспорта объекта
          </small>
        </div>
        <div
            class="flex flex-col w-full parent-prompt top-input"
            style="
                        margin-right: 20px;
                        margin-bottom: 15px;
                        align-items: start;
                    "
        >
          <input
              v-model="form.passport_number"
              type="text"
              placeholder="Номер паспорта"
              style="margin: 0;"
          />
          <small class="prompt">
            Номер паспорта объекта
          </small>
        </div>
        <div
            class="flex flex-col w-full parent-prompt top-input"
            style="margin-bottom: 15px;margin-right: 0;align-items: start"
        >
          <input
              v-model="form.inn"
              type="text"
              placeholder="ИНН"
              style="margin: 0;"
          />
          <small class="prompt">
            ИНН объекта
          </small>
        </div>
      </div>
      <div class="inputs">
        <div class="flex flex-col w-full parent-prompt top-input birthday">
          <input
              v-model="form.birth_date"
              type="text"
              title="some title ..."
              style="margin: 0;"
              placeholder="Дата рождения"
              :class="{ 'border-color-red': birth_date_error && form.birth_date != '', }"
              @keydown="multiInput"
          />
          <small
              class="prompt"
              :class="{ 'bg-red': birth_date_error && form.birth_date != '', }"
          >
            Дата рождения объекта в формате ДД.ММ.ГГГГ
          </small>
        </div>
      </div>

      <div class="flex items-center">
        <button
            class="btn"
            @click="getPrice()"
        >
          Отправить запрос
        </button>
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
      Важно! Все запросы автоматически удаляются спустя 2 часа после просмотра.
    </div>
    <div
        v-if="query_list.length"
        class="items head-item"
    >
      <div class="item select-none" style="height: 35px">
        <div class="item__header item-title">ФИО</div>
        <div class="item__header item-date" style="">Дата</div>
        <div class="item__header item-price" style="">Стоимость</div>
        <div class="item__header item__control"></div>
        <div class="item__header delete-icon"></div>
      </div>
    </div>

    <div class="items">
      <div
          v-for="query in query_list"
          :key="query.query_id"
          class="item"
      >
        <div class="item__content item__content-title item-title">{{ query.query_title }}</div>
        <div class="item__content item-date">
          {{ getItemDate(new Date(query?.query_created_at)) }}
        </div>
        <div class="item__content item-price">
          {{ query.balance }} руб.
        </div>
        <div
            v-if="query.query_status === 'pending'"
            class="item__content"
            style="height: 30px;position: relative; pointer-events: none;"
        >
          <button
              class="item-btn btn"
              style="width: 130px; background: #A4CFFA;color: #333;"
          >
            Выполняется
          </button>
        </div>
        <div
            v-else-if="query.query_status === 'queue'"
            class="item__content"
            style="height: 26px;position: relative; pointer-events: none;"
        >
          <button
              class="item-btn btn"
              style="width: 120px; height: 26px;background: #FFC636;color: #333;"
          >
            В очереди
          </button>
        </div>
        <i
            v-else-if="query.query_status === 'xmlriver on update'"
            class="item__content fa-solid fa-circle-exclamation"
            :title="'Сервис на обновлении!\n\nПопробуйте позже.'"
            style="font-size: 17px;color: #ec5e5e;"
        ></i>
        <i
            v-else-if="query.query_status === 'failed'"
            class="item__content fa-solid fa-circle-exclamation"
            :title="'Ошибка сервера!\n\nПопробуйте позже.'"
            style="font-size: 17px;color: #ec5e5e;"
        ></i>
        <button
            v-else
            class="item-btn download btn"
            @click="viewQuery(query)"
        >
          Посмотреть
          <i
              v-show="query.downloading"
              class="fa-solid fa-spinner"
              style="margin-left: 5px;"
          ></i>
        </button>
        <i
            class="item__content fa-solid fa-trash delete-icon"
            style="cursor: pointer"
            @click="deleteQuery(query.query_id, update_current_timestamp)"
        ></i>
      </div>
      <div
          v-show="query_list_loading"
          class="item"
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
          v-show="query_list.length > 0 "
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
import Multiselect from 'vue-multiselect';
import router from '../router/router.js';
import {useQueryManagement} from '../composables/useQueryManagement.js';
import {usePagination} from '../composables/usePagination.js';
import {useTimestamp} from '../composables/useTimestamp.js';
import {getItemDate} from '../utils/dateUtils.js';

const defaultLanguage = localStorage.getItem('defaultLanguage');
const checkedLanguages = ref(defaultLanguage && defaultLanguage !== 'null' ? [JSON.parse(defaultLanguage)] : [{name: 'Русский', code: 'ru'}]);
const temp_price = ref(0);
const confirm_model = ref(false);

const {
  query_list,
  query_list_loading,
  news_count,
  getUserQueries,
  getUserQueriesCount,
  deleteQuery
} = useQueryManagement('irbis');
const {selected_page, set_selected_page} = usePagination();
const {update_current_timestamp} = useTimestamp();
const languageError = ref(false);

const form = reactive({
  search_surname: '',
  search_name: '',
  search_patronymic: '',
  passport_series: '',
  passport_number: '',
  inn: '',
  birth_date: ''
});

const selectedRegions = ref([]);
const regionsOptions = ref([]);
const regionsLoading = ref(false);

const surname_error = ref(false);
const name_error = ref(false);
const patronymic_error = ref(false);
const birth_date_error = ref(false);
const regions_error = ref(false);

const validateDateFormat = (date) => {
  if (!date || date.trim() === '') {
    return true;
  }

  const trimmedDate = date.trim();
  const datePattern = /^\d{2}\.\d{2}\.\d{4}$/;

  if (!datePattern.test(trimmedDate)) {
    return false;
  }

  const [day, month, year] = trimmedDate.split('.').map(num => parseInt(num, 10));

  if (month < 1 || month > 12) {
    return false;
  }

  if (day < 1 || day > 31) {
    return false;
  }

  if (year < 1900 || year > new Date().getFullYear()) {
    return false;
  }

  const dateObj = new Date(year, month - 1, day);

  return dateObj.getDate() === day &&
         dateObj.getMonth() === month - 1 &&
         dateObj.getFullYear() === year;
};

const loadRegions = async () => {
  regionsLoading.value = true;
  try {
    const response = await fetch('/api/irbis/regions', {
      method: 'GET',
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      regionsOptions.value = data.map(region => ({
        code: region.id,
        name: `${region.id} - ${region.name}`
      }));
    } else {
      regionsOptions.value = [
        { code: 77, name: '77 - Москва' },
        { code: 78, name: '78 - Санкт-Петербург' },
        { code: 50, name: '50 - Московская область' }
      ];
    }
  } catch (error) {
    console.error('Error loading regions:', error);
    regionsOptions.value = [
      { code: 77, name: '77 - Москва' },
      { code: 78, name: '78 - Санкт-Петербург' },
      { code: 50, name: '50 - Московская область' }
    ];
  } finally {
    regionsLoading.value = false;
  }
};

const validateRegions = () => {
  return selectedRegions.value.length >= 1 && selectedRegions.value.length <= 2;
};

const multiInput = (event) => {
  if (event.ctrlKey && event.code === 'KeyV') {
    form.search_surname = '';
    setTimeout(() => {
      let full_name = form.search_surname.split(' ').filter(str => str !== '');
      form.search_surname = full_name[0] ?? '';
      form.search_name = full_name[1] ?? '';
      form.search_patronymic = full_name[2] ?? '';
    }, 5);
  }
};

const clearAllFields = () => {
  form.search_surname = '';
  const defaultLang = localStorage.getItem('defaultLanguage');
  checkedLanguages.value = defaultLang && defaultLang !== 'null' ? [JSON.parse(defaultLang)] : [{name: 'Русский', code: 'ru'}];
  form.search_name = '';
  languageError.value = false;
  form.search_patronymic = '';
  form.inn = '';
  form.passport_number = '';
  form.passport_series = '';
  selectedRegions.value = [];
  birth_date_error.value = false;
  regions_error.value = false;
};

const viewQuery = (query) => {
  if (query?.query_status === 'done') {
    window.open(`/query?result_id=${query.query_id}&query_type=irbis`, '_blank');
  }
};

const getHTMLPage = () => {
  if (temp_price.value > user_balance.value) {
    temp_price.value = 'loading...';
    confirm_model.value = true;
    return;
  }

  confirm_model.value = false;
  surname_error.value = form.search_surname === '';
  name_error.value = form.search_name === '';
  birth_date_error.value = !validateDateFormat(form.birth_date);
  regions_error.value = !validateRegions();
  if (
      form.search_surname !== '' &&
      form.search_name !== '' &&
      !birth_date_error.value &&
      !regions_error.value
  ) {
    const query_data = {
      last_name: form.search_surname.trim(),
      first_name: form.search_name.trim(),
      second_name: form.search_patronymic.trim(),
      birth_date: form.birth_date.trim(),
      passport_series: form.passport_series.trim(),
      passport_number: form.passport_number.trim(),
      inn: form.inn.trim(),
      regions: selectedRegions.value.map(region => region.code),
    };
    clearAllFields();

    query_list.value.unshift({
      'query_title': `${query_data.last_name} ${query_data.first_name} ${query_data.second_name}`,
      'query_unix_date': '1980/01/01 00:00:00',
      'old_query_unix_date': '1980/01/01 00:00:00',
      'query_created_at': new Date().format('Y-m-d h:i:s'),
      query_status: 'pending',
      balance: temp_price.value
    });
    temp_price.value = 0;

    query_list.value = query_list.value.slice(0, 20);

    let temp_query = query_list.value[0];

    getUserQueriesCount();

    fetch(`/api/queries/find_by_irbis`, {
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

const getPrice = () => {
  surname_error.value = form.search_surname === '';
  name_error.value = form.search_name === '';
  birth_date_error.value = !validateDateFormat(form.birth_date);
  regions_error.value = !validateRegions();
  if (surname_error.value || name_error.value || birth_date_error.value || regions_error.value || form.search_surname === '' || form.search_name === '') return;
  temp_price.value = 'loading...';
  confirm_model.value = true;
  if (
      form.search_surname !== '' &&
      form.search_name !== ''
  ) {
    temp_price.value = 100;
  }
};


watch(selected_page, (page) => {
  query_list.value = [];
  getUserQueries(page);
});

watch(events, () => {
  getUserQueries(selected_page.value);
}, {deep: true});

watch(selectedRegions, (newVal) => {
  if (newVal.length > 2) {
    selectedRegions.value = newVal.slice(0, 2);
  }
  if (validateRegions()) {
    regions_error.value = false;
  }
});

onMounted(() => {
  clearAllFields();
  loadRegions();
  query_list_loading.value = true;
  getUserQueriesCount();
  getUserQueries();
  update_current_timestamp();
});
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

.item-title {
  text-transform: capitalize;
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

.multiselect-error {
  border-color: red !important;
}

.multiselect-error .multiselect__tags {
  border-color: red !important;
}

.birthday {
  margin-right: 0;
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
