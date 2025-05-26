<template>
    <VSidebar
        :menu="menu"
        @click.stop="refresh()"
    />
    <div
        class="wrap"
        style="width: 100%"
        @click.stop="refresh()"
    >
        <VHeader
            :menu="menu"
            @toggle-menu="toggleMenu"
        />
        <div v-if="resultReceived" class="payment-result">
          <div style="width: 100%; display: flex; justify-content: end;">
            <i
                class="fa fa-xmark gray"
                style="cursor: pointer"
                aria-hidden="true"
                @click="resultReceived = false"
            ></i>
          </div>
          <div class="payment-result__container">
            <div>
              <i
                  :class="iconClass"
                  style="margin-top: 6px"
              ></i>
            </div>
            <div class="payment-result__info">
              <h3>
                Пополнение баланса
              </h3>
            </div>
          </div>
          <span style="margin-left: 32px; margin-top: 12px">
            {{ message }}
          </span>
          <div style="width: 100%; display: flex; justify-content: end;">
            <button
                class="btn"
                style="margin-top: 20px"
                @click="resultReceived = false"
            >
              OK
            </button>
          </div>
        </div>
        <div
            v-else
            class="w-full"
            style="flex-direction: column; margin-top: 50px"
        >
            <h1 class="payment-title">Пополнение баланса</h1>
            <div
                class="payment-block"
                style="background: white;padding: 20px 10px 20px 10px;"
            >
                <span style="color: rgb(38, 38, 38);">Введите сумму пополнения:</span>
                <div
                    class="sum"
                    style="display: flex;flex-direction: column;"
                >
                    <input
                        v-model="amount"
                        type="number"
                        class="sum-input"
                        :step="100"
                        :min="0"
                    >
                </div>
                <button
                    v-if="!loading && !confirmationError"
                    class="item-btn btn"
                    @click="confirmUser"
                >
                  Пополнить
                </button>
                <div v-if="loading">
                  Загрузка...
                </div>
                <div
                    v-if="confirmationError"
                    class="confirmation-error"
                >
                  Ваш аккаунт не подтвержден, повторное письмо отправлено на вашу почту
                </div>
            </div>
            <div
                v-if="amount <= 0"
                id="element"
            ></div>
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
import {user_id, user_name} from "../use/index";

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
        loading: false,
        confirmationError: false,
        transactionId: 0,
        transactionDate: 0,
        message: 'Транзакция прошла успешно, баланс пополнен.',
        iconClass: 'fa fa-circle-check green',
        resultReceived: false,
    }),
    methods: {
      toggleMenu(bool) {
        this.menu = bool;
      },
      sendData(amount, transactionId) {
        fetch('https://api.ipify.org?format=json')
          .then(res => res.json())
          .then(data => {
            const ip = data.ip;
            const payload = {
              transaction_id: transactionId,
              currency: "RUB",
              payment_amount: amount,
              operation_type: "Payment",
              invoice_id: "123",
              account_id: localStorage.getItem('user_id'),
              email: localStorage.getItem('user_name'),
              date_time: new Date().toISOString(),
              ip_address: ip,
              status: "Completed"
            };

            return fetch('/api/users/top_up_balance', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              credentials: "include",
              body: JSON.stringify(payload)
            })
          })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json;
          })
          .then(data => console.log(data))
          .catch((error) => {
            console.log(error)
          })
      },
      confirmUser() {
        this.loading = true;
        fetch(`/api/users/is_confirmed`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        })
            .then((response) => {
              this.loading = false;
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              } else {
                this.initPayment()
              }
              return response.json;
            })
            .catch(() => {
              this.confirmationError = true
              this.loading = false
            })
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
              if (widgetResult.data.ReasonCode) {
                this.message = 'Произошла ошибка, баланс не пополнен.';
                this.iconClass = 'fa fa-circle-exclamation red';
              } else {
                this.message = 'Транзакция прошла успешно, баланс пополнен.';
                this.iconClass = 'fa fa-circle-check green';
                this.sendData(this.amount, widgetResult.data.transactionId)
              }
              this.resultReceived = true;
            }).catch(function(error) {
              this.resultReceived = true;
              this.message = 'Произошла ошибка, баланс не пополнен.';
              this.iconClass = 'fa fa-circle-exclamation red';
              console.log('error', error);
            });
        },
    },
}
</script>

<style>
.payment-result {
  margin: 200px auto;
  display: flex;
  background-color: white;
  flex-direction: column;
  justify-content: center;
  padding: 20px;
  max-width: 500px;
  border-radius: 10px;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
}

.payment-result__container {
  display: flex;
  width: 100%;
  gap: 16px;
}

.payment-result__info {
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

.confirmation-error {
  border: 1px solid red;
  border-radius: 3px;
  background: #f1f4f9;
  text-align: center;
  justify-content: center !important;
  color: red;
  margin: 10px 15px 0 15px;
  padding: 3px;
}
</style>