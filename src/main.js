import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/router';
import Vue3Toasity from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import VueTelInput from 'vue3-tel-input'
import 'vue3-tel-input/dist/vue3-tel-input.css'

Number.prototype.push_space = function () {
    return [...[...this.toString()].reverse().join('').match(/.{1,3}/g).join(' ')].reverse().join('')
}
String.prototype.push_space = function () {
    const temp_integer = parseInt(this);
    return isNaN(temp_integer) ? this : temp_integer.push_space()
}
const app = createApp(App);

app
    .use(
        Vue3Toasity,
        {
            autoClose: 3000,
        },
    )
    .use(VueTelInput)
    .use(router)
    .mount('#app')



