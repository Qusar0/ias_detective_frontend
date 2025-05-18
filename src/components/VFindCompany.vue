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
              <template v-else> {{ temp_price }} </template>
              руб., пополните баланс!
            </div>
            <div
                v-else
                class="title"
            >
              Вы уверены, что хотите сделать запрос за
              <i v-if="temp_price == 'loading...'" class="fa-solid fa-spinner"></i>
              <template v-else> {{ temp_price ?? '10' }} </template>
              руб.?
            </div>
            <!-- ₽ -->
            <!-- рублей. -->
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
                  :disabled="temp_price == 'loading...'"
                  :style="temp_price == 'loading...' ? 'background: #ccc;' : ''"
                  @click="confirm_model = false"
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
                  :disabled="temp_price == 'loading...'"
                  :style="temp_price == 'loading...' ? 'background: #ccc;' : ''"
                  @click.stop="getHTMLPage()"
              >
                Да
              </button>
            </div>
          </div>
        </div>
        <div
            v-show="error_model"
            class="confirm-model"
            @click="error_model = false"
        >
            <div
                class="confirm-model_body"
                @click.stop
            >
                <div
                    class="title"
                    style="color: rgb(236, 94, 94);font-size: 17px;"
                >
                  {{ form.company_name == '' ? 'Название компаний это обязательное поле!' : 'Название компаний указано не корректно!'}}
                </div>
                <div class="flex items-center">
                    <button
                        class="add-item cancel"
                        @click="error_model = false"
                    >
                      Закрыть
                    </button>
                </div>
            </div>
        </div>

        <div
            class="form"
            style="padding: 15px 25px !important;margin-bottom: 15px;"
        >
            <ul>
                <li>Укажите наиболее распространенный вариант написания названия компании в графе «Полное наименование» – именно по нему будет осуществляться поиск. Примеры заполнения: ПАО «СберБанк»; Ультрамар; потребительский кооператив "Биллионс".</li>
                <li>Графу «Дополнительное наименование» следует заполнить, если компания имеет второй вариант часто используемого наименования. Пример: "Магнитогорский птицеводческий комплекс" / ООО "МПК"; потребительский кооператив "Биллионс" / МПК ВО "Биллионс".</li>
                <li>Если название является часто используемым (пример: ООО «Альфа»), в обязательном порядке следует указать город нахождения компании и желательно указать направление деятельности изучаемой компании (пример: охрана) в графе «Плюс-слова».</li>
                <li>Ключевые слова, минус и плюс-слова вводите по одному / одной фразе на строке, после чего нажмите Enter или кнопку «Добавить» - повторите для нужного количества слов.</li>
                <li>Список ключевых слов можно загрузить из файла – кнопка загрузки появится после наведения курсора на соответствующее поле ввода.</li>
                <li>Будьте внимательны при заполнении плюс и минус-слов. Изучите подсказки, всплывающие при наведении курсора на данные поля.</li>
            </ul>
        </div>
        <div class="form">
            <div class="inputs">
                    <div class="flex flex-col w-full parent-prompt top-input">
                        <input
                            v-model="form.company_name"
                            type="text"
                            title="some title ..."
                            style="margin: 0;"
                            placeholder="Наименование компании"
                            :class="{ 'border-color-red': surname_error && form.company_name == '', }"
                        />
                        <small
                            class="prompt"
                            :class="{ 'bg-red': surname_error && form.company_name == '', }"
                        >
                          Укажите наиболее распространенный вариант написания названия компании.
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
                            v-model="form.extra_name"
                            type="text"
                            placeholder="Дополнительное наименование"
                            style="margin: 0;"
                        />
                        <small class="prompt">Укажите второй вариант наименования компании (к примеру, аббревиатура)</small>
                        <!-- <small
                            class="prompt"
                            :class="{
                                'bg-red': name_error && form.extra_name == '',
                            }"
                            >Введите данные объекта в именительном падеже</small
                        > -->
                    </div>
                    <div
                        class="flex flex-col w-full parent-prompt top-input"
                        style="margin-bottom: 15px;margin-right: 0;align-items: start"
                    >
                        <input
                            v-model="form.location"
                            type="text"
                            placeholder="Местонахождение (город, страна)"
                            style="margin: 0;"
                        />
                        <small class="prompt">Город лучше не указывать, если название компании является уникальным. Пример: <i>«Международный потребительский кооператив взаимного обеспечения "Биллионс"</i>.</small>
                        <!-- <small
                            class="prompt"
                            :class="{
                                'bg-red':
                                    patronymic_error &&
                                    form.location == '',
                            }"
                            >Введите данные объекта в именительном падеже</small
                        > -->
                    </div>
                <!-- <div class="flex flex-col w-full parent-prompt top-input" style="margin-right: 0;">
                    <input v-model="form.company_name" type="text" title="some title ..."
                        style="margin-right: 0; margin-bottom: 0" placeholder="Введите почту" :class="{
                            'border-color-red':
                                surname_error,
                        }" @keydown="multiInput" />
                    <small class="prompt" :class="{
                        'bg-red':
                            surname_error,
                    }">Введите почтовый адрес</small>
                </div> -->

            </div>

            <div class="flex" style="margin-bottom: 20px;">
                <list-input
                    style="width: 100%;"
                    :item="keys_list.keyword"
                    :prompt="'Укажите как можно больше слов, которые могут встречаться в связи с упоминаемой компанией – фамилии руководства, города присутствия, направления деятельности компании, ситуации, связанные с ней и др.'"
                ></list-input>
                <!-- <list-input :item="keys_list.prohibited_site"></list-input> -->
            </div>
            <div class="flex">
                <list-input
                    :item="keys_list.minus"
                    :prompt="'Используйте в случаях, когда требуется исключить определенные сочетания упоминаемых объектов. К примеру, вы ищите компанию «ВТБ», занимающуюся строительством зданий. В этом случае можно указать такие минус-слова: «банк», «страхование», чтобы исключить поиск упоминаний Банка ВТБ из задания.'"
                ></list-input>
                <list-input
                    :item="keys_list.plus"
                    :prompt="'Укажите слова, которые неразрывно связаны с деятельностью изучаемой компании – все остальные материалы будут отфильтрованы по признаку наличия данных плюс-слов.'"
                ></list-input>
            </div>

            <div class="flex items-center justify-between" style="height: 30px;margin-top: 10px;">
                <!-- <label class="flex items-center">
                    <input type="checkbox" class="chbox" v-model="chbox.company_negativ" />
                    <span style="user-select: none">Негатив</span>
                </label> -->

                <label class="flex items-center parent-prompt-hover">
                    <input
                        v-model="chbox.company_negativ"
                        type="checkbox"
                        class="chbox"
                    />
                    <small class="prompt-hover">
                        Поиск негативных упоминаний о компании.
                    </small>
                    <span style="user-select: none">Негатив</span>
                </label>

                <!-- <label class="flex items-center">
                    <input type="checkbox" class="chbox" v-model="chbox.company_reputation" />
                    <span style="user-select: none">Репутация</span>
                </label> -->

                <label class="flex items-center parent-prompt-hover">
                    <input
                        v-model="chbox.company_reputation"
                        type="checkbox"
                        class="chbox"
                    />
                    <small class="prompt-hover">
                        Поиск материалов, содержащих отзывы клиентов, бывших работников.
                    </small>
                    <span style="user-select: none">Репутация</span>
                </label>

                <!-- <label class="flex items-center">
                    <input type="checkbox" class="chbox" v-model="chbox.company_relations" />
                    <span style="user-select: none">Связи</span>
                </label> -->

                <label class="flex items-center parent-prompt-hover">
                    <input
                        v-model="chbox.company_relations"
                        type="checkbox"
                        class="chbox"
                    />
                    <small class="prompt-hover">
                        Поиск материалов, содержащих сведения о связанных лицах.
                    </small>
                    <span style="user-select: none">Связи</span>
                </label>
                <!-- <label class="flex items-center">
                    <input type="checkbox" class="chbox" v-model="chbox.company_report" />
                    <span style="user-select: none">Досье</span>
                </label> -->

                <label class="flex items-center parent-prompt-hover">
                    <input
                        v-model="chbox.company_report"
                        type="checkbox"
                        class="chbox"
                    />
                    <small class="prompt-hover">
                        Поиск по всем рубрикам<br> 
                        (негатив, репутация, связи).
                    </small>
                    <span style="user-select: none">Досье</span>
                </label>
            </div>
            <div
                class="flex items-center justify-between message--warning"
                style="display: flex; justify-content: center; align-items: center;"
            >
              <i
                  class="fa fa-exclamation-circle"
                  aria-hidden="true"
                  style="margin-right: 4px; padding-top: 2px;"
              ></i>
              Важно! Все запросы автоматически удаляются спустя 2 часа после скачивания.
            </div>
            <button
                class="btn"
                style="white-space: nowrap;"
                @click="getPrice()"
            >
                Отправить запрос
            </button>
            <!--<div class="flex items-center">-->
            <!--<label class="flex items-center">
                    <input type="checkbox" class="chbox" v-model="chbox.default_keywords" />
                    <span style="user-select: none"
                        >стандартные ключевые слова</span
                    >
                </label>-->
            <!--</div>-->
        </div>
        <div style="margin: 15px auto;max-width: 900px;">
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
                    
                    <label class="flex items-center search-engine-label parent-prompt-hover">
                        <input 
                            type="checkbox" 
                            class="chbox" 
                            v-model="engines.yandex"
                        />
                        <span style="user-select: none; margin-left: 5px;">
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
          <div class="item__header item-title">Компания</div>
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
              <div class="item__content item-date">{{ getItemDate(new Date(query?.query_created_at)) }}</div>
              <div class="item__content item-price">{{ query.balance }} руб.</div>
              <i
                  v-if="query.query_status == 'pending'"
                  class="item__content fa-solid fa-spinner"
              ></i>
              <i
                  v-else-if="query.query_status == 'xmlriver on update'"
                  class="item__content fa-solid fa-circle-exclamation"
                  :title="'Сервис на обновлении!\n\nПопробуйте позже.'"
                  style="font-size: 17px;color: #ec5e5e;"
              ></i>
              <i
                  v-else-if="query.query_status == 'failed'"
                  class="item__content fa-solid fa-circle-exclamation"
                  :title="'Ошибка сервера!\n\nПопробуйте позже.'"
                  style="font-size: 17px;color: #ec5e5e;"
              ></i>
              <button
                  v-else
                  class="download item-btn btn"
                  @click="downloadQuery(query.query_title, query.query_id, query)"
              >
                Скачать
                <i
                    v-show="query.downloading"
                    class="fa-solid fa-spinner"
                    style="margin-left: 5px;"
                ></i>
              </button>
              <i
                  class="item__content fa-solid fa-trash delete-icon"
                  style="cursor: pointer"
                  @click="deleteQuery(query.query_id)"
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

        <div style="max-width: 900px;margin: 15px auto 0;display: flex;">
            <v-pagination
                :selected_page="selected_page"
                :general_count="news_count"
                :set_selected_page="set_selected_page"
            />
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
import Multiselect from "vue-multiselect";

export default {
    setup() {
        return { isAuthorized, prohibited_model, keywords_model, keys_list, events, user_balance };
    },
    components: {
      Multiselect,
        ListInput,
        VPagination,
    },
    data() {
        return {
            query_list_loading: true,
            confirm_model: false,
            current_timestamp: new Date().valueOf(),
            query_list: [],
            languageOptions: JSON.parse(localStorage.getItem('languages')),
            checkedLanguages: [],
            prohibited_site: "",
            prohibited_sites: [],
            temp_price: 0,
            keyword: "",
            keywords: [],
            chbox: {
                company_negativ: true,
                company_reputation: true,
                company_relations: true,
                company_report: true,
            },
            engines: {
                google: true,
                yandex: false
            },

            form: {
                company_name: "",
                extra_name: "",
                location: "",
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
          if (!this.engines.google && !this.engines.yandex) {
            return;
          }
          this.temp_price = 'loading...';
          this.confirm_model = true;
          this.surname_error = this.form.company_name == "";
          if (
              this.form.company_name != ""
          ) {
            const query_data = {
              search_engines: [
                ...(this.engines.google ? ['google'] : []),
                ...(this.engines.yandex ? ['yandex'] : [])
              ],
              languages: this.checkedLanguages.length ? this.checkedLanguages.map(item => item.code) : [],
              company_name: this.form.company_name.trim().replace(/^"(.*)"$/, '$1'),
              extra_name: this.form.extra_name.trim().replace(/^"(.*)"$/, '$1'),
              location: this.form.location.trim(),
              keywords: this.keys_list.keyword.list,
              search_minus: this.keys_list.minus.list.map(keyword => `+-${keyword}`).join(""),
              search_plus: this.keys_list.plus.list.map(keyword => `+${keyword}`).join(""),
              default_keywords_type: Object.keys(this.chbox).filter(temp_chbox => this.chbox[temp_chbox]).join(', ')
            }

            fetch(`/api/calculate_price`, {
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
                })
                .then((response) => {
                  if (response) this.temp_price = response.price;
                })
                .catch((error) => {
                  console.log("error", error);
                })
          }
        },
        inputEmail(event) {
            let regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');

            this.surname_error = true;
            if (regex.test(event.target.value)) {
                this.surname_error = false;
            }
            this.form.company_name = event.target.value;
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
        uploadFile(event, array_name = 'prohibited_sites', modal_name = 'prohibited_model') {

            let file = event.target.files[0];

            let reader = new FileReader();

            reader.readAsText(file);

            reader.onload = () => {
                if (reader.result) this[array_name] = reader.result.trim().split(/\r?\n/).map(item => item.trim());
                this[modal_name] = true
            };

            reader.onerror = function () {
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
            this.form.company_name = '';
            this.form.extra_name = '';
            this.checkedLanguages = [];
            this.form.location = '';
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
            this.surname_error = this.form.company_name == "";
            if (
                this.form.company_name != ""
            ) {
                const query_data = {
                    search_engines: [
                        ...(this.engines.google ? ['google'] : []),
                        ...(this.engines.yandex ? ['yandex'] : [])
                    ],
                    languages: this.checkedLanguages.length ? this.checkedLanguages.map(item => item.code) : [],
                    company_name: this.form.company_name.trim().replace(/^"(.*)"$/, '$1'),
                    extra_name: this.form.extra_name.trim().replace(/^"(.*)"$/, '$1'),
                    location: this.form.location.trim(),
                    keywords: this.keys_list.keyword.list,
                    search_minus: this.keys_list.minus.list.map(keyword => `+-${keyword}`).join(""),
                    search_plus: this.keys_list.plus.list.map(keyword => `+${keyword}`).join(""),
                    default_keywords_type: Object.keys(this.chbox).filter(temp_chbox => this.chbox[temp_chbox]).join(', ')
                }
                this.clearAllFields()

                this.query_list.unshift({
                    "query_title": `${query_data.company_name}`,
                    "query_unix_date": "1980/01/01 00:00:00",
                    "old_query_unix_date": "1980/01/01 00:00:00",
                    "query_created_at": new Date().format('Y-m-d h:i:s'),
                    query_status: "pending",
                })
                this.temp_price = 0;

                this.query_list = this.query_list.slice(0, 20);

                let temp_query = this.query_list[0]

                this.getUserQueriesCount()

                fetch(`/api/queries/find_by_company`, {
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
      deleteQuery(id) {
        fetch(`/api/queries/delete_query?query_id=${id}`, {
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
        getUserQueriesCount() {
            fetch(`/api/queries/queries_count?query_category=company`, {
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
        getUserQueries(page = 1) {
            fetch(`/api/queries/query_getter?query_category=company&page=${page - 1}`, {
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
            fetch(`/api/queries/download_query`, {
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
        this.clearAllFields()
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
    /* font-size: 16px; */
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
/* .parent-prompt-hover:not(.parent-prompt-hover:hover) > .prompt-hover {
    opacity: 0;
    display: none;
} */
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
  border: 1px solid orange;
  border-radius: 3px;
  background: #f1f4f9;
  text-align: center;
  justify-content: center !important;
  color: orange;
  margin: 10px 0 0 0;
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
