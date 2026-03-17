<template>
  <div class="content">
    <div class="confirm-model" v-show="succeed_send_message" @click="succeed_send_message = false">
      <div class="confirm-model_body" @click.stop>
        <div class="title">Ваш запрос был успешно отправлен!</div>
        <div class="flex items-center" style="justify-content: flex-end;">
          <button class="add-item confirm" @click.stop="succeed_send_message = false">
            Продолжить
          </button>
        </div>
      </div>
    </div>

    <div class="form" style="max-width: 700px;">
      <div style="font-weight: 600; line-height: 1; margin-bottom: 9px;font-size: 21px;">Написать нам
      </div>
      <div class="inputs flex-col" style="flex-direction: column;gap: 10px;">
        <div class="flex flex-col w-full parent-prompt top-input" style="border: none !important;">
          <input
              v-model="form.theme" type="text" title="some title ..." placeholder="Контакт для связи"
              style="margin-right: 0;margin-bottom: 0;border: none !important;font-size: 15px;"
          ><small
            class="prompt"
        >Введите свой контакт для связи с тех под.</small>
        </div>
        <div
            class="flex flex-col w-full parent-prompt top-input"
            style="margin-right: 20px; margin-bottom: 0; align-items: start;"
        ><input
            v-model="form.description"
            type="text"
            placeholder="Тема сообщение"
            style="margin-right: 0;border: none !important;font-size: 15px;margin-bottom: 0px;"
        ><small
            class="prompt"
        >Введите тему сообщение</small></div>
        <div class="flex flex-col w-full parent-prompt top-input" style="margin-bottom: 0; align-items: start;">
                    <textarea
                        v-model="form.contacts" type="text" placeholder="Текст сообщение"
                        style="font-family: sans-serif;margin-right: 0px;margin-bottom: 0px;font-size: 15px;width: 700px;height: 150px;padding: 5px 7px;max-width: 100%;max-height: 300px;border: none !important;"
                    ></textarea><small
            class="prompt"
        >Введите текст сообщение</small>
        </div>
      </div>
      <button class="btn" @click="send_support()">Отправить</button>
    </div>

  </div>
</template>

<script>
import { isAuthorized } from '../use/index';

export default {
  setup() {
    return {isAuthorized};
  },
  data() {
    return {
      succeed_send_message: false,
      form: {
        search_surname: '',
        search_name: '',
        search_patronymic: ''
      }
    };
  },
  methods: {
    hasSpaceOrСomma(text) {
      return text.includes(' ') || text.includes(',');
    },
    send_support() {
      if (
          this.form.theme != '' &&
          this.form.description != '' &&
          this.form.contacts != ''
      ) {

        fetch(`/api/write_support`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            theme: this.form.theme.trim(),
            description: this.form.description.trim(),
            contacts: this.form.contacts.trim()
          })
        })
            .then((response) => {
              if (response?.status == 401) {
                this.isAuthorized = false;
                this.$router.push('login');
                return;
              }

              return response.json();
            })
            .then((response) => {
              this.succeed_send_message = response.status == 'message sent.';
            })
            .catch((error) => {
              console.log('error', error);
            });
      }
    }
  }
};

</script>

<style scoped>
.form textarea,
.form input[type="email"],
.form input[type="password"],
.form input[type="text"] {
  height: 30px;
  padding: 0 7px;
}

.content {
  padding: 20px;
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

.form textarea,
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

.form .btn {
  margin-top: 10px;
  margin-left: auto !important;
  font-size: 13px;
  border: none;
  height: 30px;
}

.head-item .item {
  font-size: 16px;
  font-weight: 600;
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
  display: none;
}

.parent-prompt textarea:focus + .prompt,
.parent-prompt input:focus + .prompt {
  opacity: 1;
  display: block;
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

button.add-item:hover {
  background: rgb(22, 144, 119) !important;
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
}</style>