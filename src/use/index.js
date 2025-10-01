import { reactive, ref } from 'vue';
import { bell_opened } from '../utils/notification';

export const isAuthorized = reactive(ref(undefined));
export const bool = reactive(ref(true));
export const user_name = reactive(ref(localStorage.getItem('user_name')));
export const user_balance = reactive(ref(0));
export const user_id = reactive(ref(0));
export const user_created = reactive(ref(localStorage.getItem('user_created')));

export const prohibited_model = reactive(ref(false));
export const keywords_model = reactive(ref(false));
export const dropdown = reactive(ref(false));
export const menu = reactive(ref(window.innerWidth > 1000));

export const keys_list = reactive(ref({
  prohibited_site: {
    name: 'prohibited_site',
    input: '',
    list: [],
    modal: false,
    placeholder: 'перечень запрещённых сайтов',
    prompt: 'перечень запрещённых сайтов',
    empty_list_text: 'Нет запрещённых сайтов'
  },
  keyword: {
    name: 'keyword',
    input: '',
    list: [],
    modal: false,
    placeholder: 'Ключевые слова характеризуюшие объект',
    prompt: 'Укажите как можно больше слов / фраз, характеризующих объект – профессия, должность, названия компаний, хобби, проекты, города проживания, известные связи и другую информацию. Можно указать дату рождения в кавычках (пример: «13.11.1984»). ',
    empty_list_text: 'Нет ключевых слов'
  },
  minus: {
    name: 'minus',
    input: '',
    list: [],
    modal: false,
    placeholder: 'Минус-слова',
    prompt: 'Используйте в случаях, когда требуется исключить определенные сочетания упоминаемых объектов. К примеру, вы ищите информацию в отношении директора ООО "Урал Логистика" Пушкина Александра Сергеевича. В этом случае можно такие указать минус-слова: «поэт», «писатель», «литература».',
    empty_list_text: 'Список пустой'
  },
  plus: {
    name: 'plus',
    input: '',
    list: [],
    modal: false,
    placeholder: 'Плюс-слова',
    prompt: 'Укажите слова, которые неразрывно связаны с изучаемым лицом – все остальные материалы будут отфильтрованы по признаку наличия данных плюс-слов.',
    empty_list_text: 'Список пустой'
  }
}));

export const addItem = (input, list, modal) => {
  if (
      input &&
      list.find((key) => key === input) === undefined
  )
    list.push(input);
  input = '';
  modal = true;
};

export function refresh() {
  Object.values(keys_list.value).forEach(item => {
    item.modal = false;
  });
  dropdown.value = false;
  bell_opened.value = false;
}

export function toggleItemList(item_name) {
  Object.values(keys_list.value).forEach(temp_item => {
    if (temp_item.name !== item_name) {
      temp_item.modal = false;
    } else {
      temp_item.modal = !temp_item.modal;
    }
  });
}

export async function set_user_balance(balance) {
  user_balance.value = balance;
}

export async function get_user_balance() {

  await fetch(`/api/users/get_balance`, {
    method: 'GET',
    credentials: 'include'
  })
      .then((response) => {
        if (response?.status === 401) {
          isAuthorized.value = false;
          return Promise.reject({
            message: 'Token has expired'
          });
        }
        return response.json();
      })
      .then((response) => {
        user_balance.value = response;
      })
      .catch((error) => {
        console.log('error', error);
      });
}
