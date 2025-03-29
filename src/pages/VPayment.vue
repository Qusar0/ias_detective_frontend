<template>
    <VSidebar :menu="menu" @click.stop="refresh()" />
    <div class="wrap" @click.stop="refresh()" style="width: 100%">
        <VHeader :menu="menu" @toggle-menu="toggleMenu" />
        <div class="w-full" style="flex-direction: column; margin-top: 50px">
            <h1 class="payment-title">Пополнение баланса</h1>
            <div class="payment-block" style="background: white;padding: 20px 10px 20px 10px;">
                <span style="color: rgb(38, 38, 38);">Введите сумму пополнения:</span>
                <div class="sum" style="display: flex;flex-direction: column;">
                    <input type="number" class="sum-input" v-model="amount" :step="100" :min="0">
                </div>
                <button class="item-btn btn" @click="initPayment">Пополнить</button>
            </div>
            <div id="element" v-if="amount <= 0"></div>
        </div>
    </div>
</template>

<script>
import VLogin from '../components/VLogin.vue'
import VRegister from '../components/VRegister.vue'
import VSidebar from "../components/VSidebar.vue";
import VHeader from "../components/VHeader.vue";
import {bool, refresh, menu} from '../use/index'
import PersonInfo from "../components/PersonInfo.vue";
import {user_id} from "../use/index";

export default {
    components: {
      PersonInfo,
      VSidebar,
      VHeader,
      VLogin,
      VRegister,
    },
    setup() {
        return { bool, refresh, menu, user_id }
    },
    data: () => ({
        amount: 0,
        transactionId: 0,
        transactionDate: 0,
    }),
    methods: {
      toggleMenu(bool) {
        this.menu = bool;
      },
      sendData(amount, transactionId) {
        console.log(amount)
        console.log(transactionId)
        console.log(user_id)
      },
      initPayment() {
            if (this.amount <= 0) return;

            var payments = new cp.CloudPayments({
              language: "ru-RU",
              email: "",
              applePaySupport: true,
              googlePaySupport: true,
              yandexPaySupport: true,
              tinkoffInstallmentSupport: true,
            });

            payments.pay("charge", {
              publicId: "pk_e717fab4228d07cbeb1bb6eb8e586",
              description: "Пополнение баланса",
              amount: this.amount,
              currency: "RUB",
              invoiceId: "123",
              accountId: "123",
              email: "",
              skin: "classic",
              requireEmail: true,
            }).then((widgetResult) => {
              console.log('result', widgetResult.data);
              this.sendData(this.amount, widgetResult.data.transactionId)
            }).catch(function(error) {
              console.log('error', error);
            });
        },
    },
}
</script>

<style>

.payment-title {
    color: rgb(26,179,148);
    font-size: 30px;
}

.payment-block {
  background: white;
  width: 500px;
  padding: 20px;
  border-radius: 20px;
  margin-top: 30px;
  text-align: center;
  justify-content: center;
  display: flex;
  align-items: center;
  flex-direction: column;
}

.item-btn {
    background: rgb(26,179,148);
    font-size: 13px;
    border: none;
    height: 30px;
    max-width: 215px;
    width: 30%;
    justify-content: center;
}

.sum-input {
  max-width: 300px;
  width: 100%;
  font-size: 13px;
  background: #f1f4f9;
  border: 1px solid #dadde1;
  height: 35px;
  padding: 0 10px;
  border-radius: 3px;
  margin-top: 15px;
}

.card {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 8px;
    max-width: 220px;
    width: 100%;
}

.sum {
  margin-bottom: 15px;
  max-width: 215px;
  width: 100%;
}

.item-btn:hover {
    background: #40a9ff;
}

</style>