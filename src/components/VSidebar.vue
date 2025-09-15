<template>
  <div
      class="sidebar"
      :style="{ width: menu ? '227.65px' : 0, minWidth: menu ? '214px' : '50px' }"
  >
    <div
        class="logo"
        :style="{ height: menu ? '' : '0px' }"
    >
      <div>
        <img
            src="../assets/logo-light.svg"
            width="175"
            alt="0"
            class="logo-img"
            height="100"
            style="margin-top: -12px;margin-left: -5px;"
        >
      </div>
    </div>
    <router-link
        to="/"
        class="nav-link"
        :class="{ active: $route.path == '/' }"
    >
      <i class="fa-solid fa-user-check"></i>
      <span v-show="menu">Поиск персоны</span>
    </router-link>
    <hr class="sidebar-hr" color="#3a4956">
    <router-link
        to="/find-by-number"
        class="nav-link"
        :class="{ active: $route.path == '/find-by-number' }"
    >
      <i class="fa-solid fa-phone"></i>
      <span v-show="menu">Проверка номера</span>
    </router-link>
    <hr class="sidebar-hr" color="#3a4956">
    <router-link
        to="/find-by-email"
        class="nav-link"
        :class="{ active: $route.path == '/find-by-email' }"
    >
      <i class="fa-solid fa-envelope"></i>
      <span v-show="menu">Проверка почты</span>
    </router-link>
    <hr class="sidebar-hr" color="#3a4956">
    <router-link
        to="/find-by-company"
        class="nav-link"
        :class="{ active: $route.path == '/find-by-company' }"
    >
      <i class="fa-solid fa-building"></i>
      <span v-show="menu">Поиск компании</span>
    </router-link>
    <hr class="sidebar-hr" color="#3a4956">
    <router-link
        to="/find-by-irbis"
        class="nav-link"
        :class="{ active: $route.path == '/find-by-irbis' }"
    >
      <i class="fa-solid fa-balance-scale"></i>
      <span v-show="menu">Судебные процессы</span>
    </router-link>
    <hr class="sidebar-hr" color="#3a4956">
    <router-link
        to="/gos"
        class="nav-link"
        :class="{ disabled: true }"
        title="Модуль находится в разработке"
    >
      <i class="fa-solid fa-spinner"></i>
      <span v-show="menu">Гос. реестры</span>
    </router-link>
    <hr class="sidebar-hr" color="#3a4956">
    <router-link
        to="/nicknames"
        class="nav-link"
        :class="{ disabled: true }"
        title="Модуль находится в разработке"
    >
      <i class="fa-solid fa-spinner"></i>
      <span v-show="menu">Никнейм</span>
    </router-link>
    <hr class="sidebar-hr" color="#3a4956">
    <router-link
        to="/settings"
        class="nav-link"
        :class="{ active: $route.path == '/settings' }"
    >
      <i class="fa-solid fa-gear"></i>
      <span v-show="menu">Настройки</span>
    </router-link>
    <hr class="sidebar-hr" color="#3a4956">
    <router-link
        to="/support"
        class="nav-link"
        :class="{ active: $route.path == '/support' }"
    >
      <i class="fa-solid fa-square-envelope"></i>
      <span v-show="menu">Поддержка</span>
    </router-link>
    <hr class="sidebar-hr" color="#3a4956">
    <a
        href="https://t.me/iasdetectivebot"
        target="_blank"
        class="nav-link"
    >
      <i class="fa-brands fa-telegram"></i>
      <span v-show="menu">Уведомления в Telegram</span>
    </a>
  </div>
</template>

<script>
export default {
  props: {
    menu: {
      type: Boolean,
      required: true
    }
  }
};
</script>

<style scoped>
hr.sidebar-hr {
  margin: 0 25px 0 10px !important;
}

.sidebar {
  padding-top: 10px;
  height: 100%;
  transition: .2s;
  overflow: hidden;
  min-width: 214px;
  background-color: #2f4050;
}

.nav-link {
  display: flex;
  align-items: center;
  color: #9aa6b3 !important;
  cursor: pointer;
  transition: .15s;
  text-decoration: none;
  padding: 0 15px;
  height: 40px;
  font-size: 14px;
}

.nav-link.active,
.nav-link:hover {
  background: #293846;
}

.nav-link svg {
  transition: .15s;
  fill: #fff;
}

.nav-link i {
  font-size: 14px;
  margin-right: 9px;
}

.nav-link span * {
  color: #fff;
}

.nav-link.active {
  border-left: 4px solid #357EBD;
}

.nav-link.active,
.nav-link.active span,
.nav-link.active span *,
.nav-link.active svg {
  color: #fff !important;
  fill: #fff !important;
}


.nav-link span {
  text-decoration: none;
  margin-right: auto;
  padding-bottom: 2px;
  white-space: nowrap;
}

.nav-link span * {
  text-decoration: none;
}

.nav-link svg {
  width: 20px;
  margin-left: 20px;
}


.logo {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: .15s;
  overflow: hidden;
}

.logo div {
  display: flex;
  align-items: center;
  width: 150px;
  font-size: 40px;
  font-weight: 600;
  color: #fff !important;
  margin: auto;
}

.logo-title {
  padding-left: 12px;
  padding-bottom: 5px;
}

.disabled {
  opacity: 0.5;
  pointer-events: none;
}

</style>


