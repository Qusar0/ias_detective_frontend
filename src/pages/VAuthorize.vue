<template>
  <div class="w-full" style="flex-direction: column;justify-content: center;">
    <img src="../assets/logo-black.svg" width="260" alt="0" class="logo-img" height="145"
         style="margin-top: auto;margin-left: -5px;margin-bottom: 25px;">
    <div class="modal">
      <div class="tabs w-full">
        <div class="login-tab" :class="{
                    'active-tab': bool
                }" @click="bool = !bool">Вход
        </div>
        <div class="login-tab" :class="{
                    'active-tab': !bool
                }" @click="bool = !bool">Регистрация
        </div>
      </div>

      <KeepAlive>
        <component :bool="bool" :is="bool ? 'VLogin' : 'VRegister'"></component>
      </KeepAlive>
    </div>
  </div>
</template>

<script>
import VLogin from '../components/VLogin.vue';
import VRegister from '../components/VRegister.vue';
import {bool} from '../use/index';

export default {
  components: {
    VLogin,
    VRegister
  },
  setup() {
    return {bool};
  }
};
</script>

<style>
.modal {
  display: flex;
  width: 350px;
  margin: auto;
  margin-top: 0;
  display: flex;
  flex-direction: column;
}

.w-full {
  width: 100%;
  display: flex;
  align-items: center;
}

.tabs {
  display: flex;
  background: white;
  border-radius: 3px 3px 0 0;
}

.login-tab {
  height: 40px;
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.active-tab {
  border-bottom: 3px solid #4a80d0;
}

.form {
  border-radius: 0 0 3px 3px;
  margin-top: 5px;
  background: white;
  padding: 25px 30px 25px 30px;
  font-size: 13px;
}

.form input[type="email"],
.form input[type="password"],
.form textarea,
.form input[type="text"] {
  font-size: 13px;
  background: #f1f4f9;
  border: 1px solid #dadde1;
  height: 35px;
  padding: 0 10px;
  border-radius: 3px;
  width: 100%;
  margin-bottom: 15px;
}

.form label > div {
  color: #727476;
  font-weight: 500;
  padding-bottom: 4px;
}

.remember-me input {
  margin-top: 3.5px;
  margin-right: 3px;
  height: 14.5px;
  width: 18px;
  background: #f1f4f9;
  border: 1px solid #dadde1;
}

.remember-me {
  display: flex;
  align-items: center;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.btn.disabled {
  background: #e6e9ec;
  cursor: default;
}

</style>