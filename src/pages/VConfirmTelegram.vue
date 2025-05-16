<template>
  <div
      class="confirm-email"
      :class="loading ? 'gray' : success ? 'green' : 'red'"
  >
    <h2>Подключение Telegram</h2>
    <p v-if="loading">Привязываем ваш Telegram...</p>
    <p v-if="message">{{ message }}</p>
    <button
        class="btn"
        @click="router().push('/')"
    >
      На главную
    </button>
  </div>
</template>

<script>
import router from "../router/router.js";

export default {
  methods: {
    router() {
      return router
    }
  },
  data() {
    return {
      loading: true,
      success: false,
      message: '',
    }
  },
  async mounted() {
    const token = this.$route.query.chat;
    try {
      const res = await fetch(`/api/telegram/connect_tg?chat=${token}`);
      const data = await res.json();
      if (data.status === 'success') {
        this.success = true;
        this.message = 'Ваш Telegram успешно привяязан!';
      } else {
        this.message = `Не удалось привязать Telegram. ${data.detail}.`;
      }
    } catch (error) {
      this.message = 'Не удалось привязать Telegram. Попробуйте еще или обратитесь в поддержку.';
    } finally {
      this.loading = false;
    }
  }
}
</script>

<style scoped>
.confirm-email {
  border: 1px solid black;
  border-radius: 3px;
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
  margin-top: 40px;
}
</style>
