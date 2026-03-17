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
        <li>Ключевые слова, минус и плюс-слова вводите по одному / одной фразе на строке, после чего нажмите Enter или
          кнопку «Добавить» - повторите для нужного количества слов.
        </li>
        <li>Список ключевых слов можно загрузить из файла – кнопка загрузки появится после наведения курсора на
          соответствующее поле ввода.
        </li>
        <li>Будьте внимательны при заполнении плюс и минус-слов. Изучите подсказки, всплывающие при наведении курсора на
          данные поля.
        </li>
      </ul>
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
      <div
          class="flex"
          style="margin-bottom: 20px;"
      >
        <list-input
            style="width: 100%;"
            :item="keys_list.keyword"
        ></list-input>
      </div>
      <div class="flex">
        <list-input :item="keys_list.minus"></list-input>
        <list-input :item="keys_list.plus"></list-input>
      </div>
      <div
          class="flex items-center justify-between"
          style="height: 30px;margin-top: 10px;"
      >

        <label class="flex items-center parent-prompt-hover">
          <input
              v-model="chbox.negativ"
              type="checkbox"
              class="chbox"
          />
          <small class="prompt-hover">
            Поиск негативных упоминаний персоны<br>
            (уголовные дела, связь с криминалом, коррупция и пр.).
          </small>
          <span style="user-select: none">Негатив</span>
        </label>
        <label class="flex items-center parent-prompt-hover">
          <input
              v-model="chbox.reputation"
              type="checkbox"
              class="chbox"
          />
          <small class="prompt-hover">
            Поиск материалов, содержащих отзывы, <br>
            биографию проверяемого, интервью с ним.
          </small>
          <span style="user-select: none">Репутация</span>
        </label>


        <label class="flex items-center parent-prompt-hover">
          <input
              v-model="chbox.relations"
              type="checkbox"
              class="chbox"
          />
          <small class="prompt-hover">
            Поиск материалов, содержащих сведения <br>
            о связанных лицах (семья, сослуживцы и пр.)
          </small>
          <span style="user-select: none">Связи</span>
        </label>


        <label class="flex items-center parent-prompt-hover">
          <input
              v-model="chbox.report"
              type="checkbox"
              class="chbox"
          />
          <small
              class="prompt-hover"
          >
            Поиск по всем рубрикам <br>
            (негатив, репутация, связи).
          </small>
          <span style="user-select: none">Досье</span>
        </label>
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
        class="form"
        style="padding: 15px 25px !important;margin: 15px auto;"
    >
      <ul>
        <li>При выборе языка запрос будет обработан с автоматическим переводом ключевых слов на выбранный язык.</li>
        <li>Переводятся предустановленные ключевые слова (негатив, репутация, связи) и слова, указанные пользователем в
          поле «Ключевые слова, характеризующие объект».
        </li>
      </ul>
    </div>
    <div
        style="margin: 15px auto;max-width: 900px;"
        :style="languageError ? 'border: 1px solid red; border-radius: 5px; margin-bottom: 8px' : ''"
    >
      <multiselect
          v-model="checkedLanguages"
          :options="languageOptions"
          :multiple="true"
          :close-on-select="false"
          placeholder="Поиск языков запроса"
          label="name"
          track-by="name"
          selectLabel="Нажмите enter, чтобы выбрать"
          deselectLabel="Нажмите enter, чтобы удалить"
          selectedLabel="Выбрано"
          :limitText="count => `и еще ${count}`"
          :limit="4"
      ></multiselect>
    </div>
    <div style="margin: 0 auto 10px;max-width: 900px;">
      <small v-if="languageError" style="color: #ec5e5e;">
        Выберите хотя бы один язык, если нажаты чекбоксы: "Негатив", "Связи", "Репутация" и/или "Досье".
      </small>
    </div>

    <div style="margin: 15px auto; max-width: 900px;">
      <div class="search-engines-container">
        <h4 style="margin-bottom: 10px; font-weight: 500;">Поисковые системы:</h4>
        <div class="flex items-center" style="gap: 20px;">
          <label class="flex items-center search-engine-label parent-prompt-hover">
            <input
                type="checkbox"
                class="chbox"
                v-model="engines.google"
            />
            <span style="user-select: none; margin-left: 5px;">
                            Google
                        </span>
            <small class="prompt-hover">
              Использовать ПС Google для поиска
            </small>
          </label>

          <label class="flex items-center search-engine-label parent-prompt-hover" style="cursor: not-allowed;">
            <input
                type="checkbox"
                class="chbox"
                v-model="engines.yandex"
                disabled
                style="opacity: 0.4;"
            />
            <span style="user-select: none; margin-left: 5px; opacity: 0.4;">
                            Yandex
                        </span>
            <small class="prompt-hover">
              Использовать ПС Яндекс для поиска
            </small>
          </label>
        </div>
        <small v-if="!engines.google && !engines.yandex" style="color: #ec5e5e;">
          Выберите хотя бы одну поисковую систему
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
        <div class="item__header item-title">ФИО</div>
        <div class="item__header item-date" style="">Дата</div>
        <div class="item__header item-price" style="">Стоимость</div>
        <div class="item__header item__control" style="width: 260px;"></div>
        <div class="item__header delete-icon"></div>
      </div>
    </div>

    <div class="items">
      <div
          v-for="query in query_list"
          :key="query.query_id"
          class="item"
      >
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
            v-if="query.query_status === 'pending'"
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
        <div
            v-else-if="query.query_status === 'queue'"
            class="item__content"
            style="height: 26px;position: relative; pointer-events: none; width: 260px;"
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
            style="font-size: 17px;color: #ec5e5e; width: 260px;"
        ></i>
        <i
            v-else-if="query.query_status === 'failed'"
            class="item__content fa-solid fa-circle-exclamation"
            :title="'Ошибка сервера!\n\nПопробуйте позже.'"
            style="font-size: 17px;color: #ec5e5e; width: 260px;"
        ></i>
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
import { onMounted, reactive, ref, watch } from 'vue';
import '../utils/index';
import Multiselect from 'vue-multiselect';
import { isAuthorized, keys_list, user_balance, languageOptions, appDefaultLanguage } from '../use/index';
import ListInput from './ListInput.vue';
import VPagination from './UI/VPagination.vue';
import { events } from '../utils/notification';
import router from '../router/router.js';
import { useQueryManagement } from '../composables/useQueryManagement.js';
import { usePagination } from '../composables/usePagination.js';
import { useTimestamp } from '../composables/useTimestamp.js';
import { getItemDate } from '../utils/dateUtils.js';
import { clearCheckboxes, clearKeysList } from '../utils/fieldUtils.js';

const checkedLanguages = ref([{name: 'Русский', code: 'ru'}]);
watch(appDefaultLanguage, (newVal) => {
  if (newVal) checkedLanguages.value = [newVal];
}, {immediate: true});
const temp_price = ref(0);
const confirm_model = ref(false);

const {
  query_list,
  query_list_loading,
  news_count,
  getUserQueries,
  getUserQueriesCount,
  deleteQuery,
  downloadQuery
} = useQueryManagement('name');
const {selected_page, set_selected_page} = usePagination();
const {update_current_timestamp} = useTimestamp();
const languageError = ref(false);

const chbox = reactive({
  negativ: false,
  reputation: false,
  relations: false,
  report: false
});

const engines = reactive({
  google: true,
  yandex: false
});

const form = reactive({
  search_surname: '',
  search_name: '',
  search_patronymic: ''
});

const surname_error = ref(false);
const name_error = ref(false);
const patronymic_error = ref(false);

const goToQueryPage = (query) => {
  if (query?.query_status === 'done') {
    window.open(`/query?result_id=${query.query_id}&query_type=person&result_title=${query.query_title}`, '_blank');
  }
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
  checkedLanguages.value = defaultLang && defaultLang !== 'null' ? [JSON.parse(defaultLang)] : [
    {
      name: 'Русский',
      code: 'ru'
    }
  ];
  form.search_name = '';
  languageError.value = false;
  form.search_patronymic = '';
  clearKeysList();
  clearCheckboxes(chbox);
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
  if (
      form.search_surname !== '' &&
      form.search_name !== ''
  ) {
    const query_data = {
      search_engines: [
        ...(engines.google ? ['google'] : []),
        ...(engines.yandex ? ['yandex'] : [])
      ],
      languages: checkedLanguages.value.length ? checkedLanguages.value.map(item => item.code) : [],
      search_surname: form.search_surname.trim(),
      search_name: form.search_name.trim(),
      search_patronymic: form.search_patronymic.trim(),
      prohibited_sites: keys_list.value.prohibited_site.list,
      keywords: keys_list.value.keyword.list,
      search_minus: keys_list.value.minus.list.map(keyword => `+-${keyword}`).join(''),
      search_plus: keys_list.value.plus.list.map(keyword => `+${keyword}`).join(''),
      default_keywords_type: Object.keys(chbox).filter(temp_chbox => chbox[temp_chbox]).join(', ')
    };
    clearAllFields();

    query_list.value.unshift({
      'query_title': `${query_data.search_surname} ${query_data.search_name} ${query_data.search_patronymic}`,
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

    fetch(`/api/queries/find_by_name`, {
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
  languageError.value = false;
  if (!engines.google && !engines.yandex) {
    return;
  }
  if ((chbox.negativ || chbox.reputation || chbox.relations || chbox.report) && !checkedLanguages.value.length) {
    languageError.value = true;
  }
  surname_error.value = form.search_surname === '';
  name_error.value = form.search_name === '';
  if (surname_error.value || name_error.value || form.search_surname === '' || form.search_name === '' || languageError.value) return;
  temp_price.value = 'loading...';
  confirm_model.value = true;
  if (
      form.search_surname !== '' &&
      form.search_name !== ''
  ) {
    const query_data = {
      search_engines: [
        ...(engines.google ? ['google'] : []),
        ...(engines.yandex ? ['yandex'] : [])
      ],
      search_patronymic: form.search_patronymic.trim(),
      keywords: keys_list.value.keyword.list,
      languages: checkedLanguages.value.length ? checkedLanguages.value.map(item => item.code) : [],
      default_keywords_type: Object.keys(chbox).filter(temp_chbox => chbox[temp_chbox]).join(', ')
    };

    fetch(`/api/queries/calculate_price`, {
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
          if (response) temp_price.value = response.price;
        })
        .catch((error) => {
          console.log('error', error);
        });
  }
};

watch(selected_page, (page) => {
  query_list.value = [];
  getUserQueries(page);
});

watch(events, () => {
  getUserQueries(selected_page.value);
}, {deep: true});

onMounted(() => {
  clearAllFields();
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
