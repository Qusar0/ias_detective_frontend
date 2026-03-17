<template>
  <div class="confirm-email">
    <div style="width: 100%; display: flex; justify-content: end;">
      <i
          class="fa fa-xmark gray"
          style="cursor: pointer"
          aria-hidden="true"
          @click="router().push('/login')"
      ></i>
    </div>
    <div class="confirm-email__container">
      <div>
        <i
            :class="iconClass"
            style="margin-top: 8px"
        ></i>
      </div>
      <div class="confirm-email__info">
        <h2>
          {{ modalTitle }}
        </h2>
      </div>
    </div>
    <span style="margin-left: 32px; margin-top: 12px">
        {{ message }}
    </span>
    <div style="width: 100%; display: flex; justify-content: end;">
      <button
          class="btn"
          :style="`background-color: ${ buttonColor }`"
          @click="router().push('/login')"
      >
        На главную
      </button>
    </div>
  </div>
</template>

<script>
import router from '../router/router.js';
import { isAuthorized } from '../use/index';

export default {
  methods: {
    router() {
      return router;
    }
  },
  data() {
    return {
      message: 'Пожалуйста, подождите. Выполняется подтверждение адреса электронной почты.',
      iconClass: 'fa fa-spinner fa-spin gray',
      modalTitle: 'Проверяем ссылку...',
      buttonColor: 'gray'
    };
  },
  async mounted() {
    isAuthorized.value = false;
    const token = this.$route.query.token;
    try {
      const res = await fetch(`/api/v1/auth/confirm/${token}`);
      const data = await res.json();
      if (data.status === 'success') {
        this.iconClass = 'fa fa-circle-check green';
        this.buttonColor = '#1AB394FF';
        this.modalTitle = 'Адрес электронной почты подтвержден!';
        this.message = 'Спасибо! Ваш адрес электронной почты подтвержден. Нажмите на кнопку ниже, чтобы войти в аккаунт.';
      } else {
        this.iconClass = 'fa fa-circle-exclamation red';
        this.buttonColor = 'red';
        this.modalTitle = 'Не удалось подтвердить адрес электронной почты.';
        this.message = 'Ссылка недействительна или срок ее действия истек. Пожалуйста, запросите новую.';
      }
    } catch (error) {
      this.iconClass = 'fa fa-circle-exclamation red';
      this.buttonColor = 'red';
      this.modalTitle = 'Произошла ошибка при подтверждении.';
      this.message = 'Попробуйте позже или обратитесь в службу поддержки.';
    }
  }
};
</script>

<style scoped>
.confirm-email {
  margin: auto;
  display: flex;
  background-color: white;
  flex-direction: column;
  justify-content: center;
  padding: 20px;
  max-width: 500px;
  border-radius: 10px;
  box-shadow: rgba(0, 0, 0, 0.16) 0 1px 4px;
}

.confirm-email__container {
  display: flex;
  width: 100%;
  gap: 16px;
}

.confirm-email__info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-right: 12px;
}

.green {
  color: #1AB394FF;
}

.gray {
  color: gray;
}

.red {
  color: red;
}

.btn {
  width: fit-content;
  margin-top: 20px;
}
</style>
