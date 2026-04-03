import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router/router';
import Vue3Toasity from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import VueTelInput from 'vue-tel-input';
import 'vue-tel-input/vue-tel-input.css';

const _originalFetch = window.fetch.bind(window);
let _refreshPromise = null;

window.fetch = async function (input, init) {
  const response = await _originalFetch(input, init);

  if (response.status !== 401) {
    return response;
  }
  if (!_refreshPromise) {
    _refreshPromise = _originalFetch('/api/v1/auth/refresh', {
      method: 'POST',
      credentials: 'include',
      headers: { accept: 'application/json' }
    })
      .then(r => r.ok)
      .catch(() => false)
      .finally(() => { _refreshPromise = null; });
  }

  const refreshed = await _refreshPromise;
  if (refreshed) {
    return _originalFetch(input, init);
  }

  return response;
};

Number.prototype.push_space = function () {
  return [...[...this.toString()].reverse().join('').match(/.{1,3}/g).join(' ')].reverse().join('');
};
String.prototype.push_space = function () {
  const temp_integer = parseInt(this);
  return isNaN(temp_integer) ? this : temp_integer.push_space();
};
const app = createApp(App);

app
    .use(
        Vue3Toasity,
        {
          autoClose: 3000
        }
    )
    .use(VueTelInput)
    .use(router)
    .mount('#app');



