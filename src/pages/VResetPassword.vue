<template>
  <div
      class="confirm-email"
  >
    <div class="form">
      <label style="display: flex; align-items: start; flex-direction: column;">
        <div>Новый пароль</div>
        <input
            v-model="password"
            type="password"
            placeholder="Ваш новый пароль"
            class="password"
        >
        <small
            v-show="!password"
            style="color: red;margin-bottom: 15px;display: block;"
        >
          Пароль не менее 8 символов
        </small>
      </label>
      <div style="display: flex; justify-content: space-between; gap: 10px">
        <button
            class="btn"
            @click="isAuthorized = false; router.push('/login')"
        >
          На главную
        </button>
        <button
            class="btn"
            :disabled="password.length < 8"
            @click="resetPassword"
        >
          Сбросить
        </button>
      </div>
      <div
          v-show="success || errorMessage"
          style="margin-top: 10px"
      >
        {{ success ? 'Пароль успешно изменен.' : errorMessage }}
      </div>
    </div>
  </div>
</template>


<script setup>
import router from '../router/router.js';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { isAuthorized } from '../use/index';

const password = ref('');
const token = ref('');
const errorMessage = ref('');
const success = ref(false);

onMounted(() => {
  const route = useRoute();
  token.value = route.query.token;
});

const resetPassword = () => {
  fetch(`/api/v1/auth/reset_password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
      new_password: password.value,
      token: token.value
    })
  })
      .then((response) => {
        response?.status === 200 ? success.value = true : errorMessage.value = 'Ошибка! Не удалось сбросить пароль.';
      });
};
</script>

<style scoped>
.confirm-email {
  text-align: center;
  height: fit-content;
  display: flex;
  flex-direction: column;
  justify-content: center !important;
  align-items: center;
  color: black;
  margin: auto;
  padding: 10px;
}

.gray {
  border: 1px solid gray;
  color: gray;
}

.green {
  border: 1px solid green;
  color: green;
}

.red {
  border: 1px solid red;
  color: red;
}

.btn {
  width: fit-content;
  margin-top: 20px;
}
</style>
