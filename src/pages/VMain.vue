<script>
import VSidebar from '../components/VSidebar.vue';
import VHeader from '../components/VHeader.vue';
import VContent from '../components/VContent.vue';
import { menu, refresh } from '../use/index';

export default {
  components: {
    VSidebar,
    VHeader,
    VContent
  },
  methods: {
    toggleMenu(bool) {
      this.menu = bool;
    },
    onBackdropClick() {
      this.menu = false;
    }
  },
  setup() {
    return {refresh, menu};
  }
};
</script>

<template>
  <v-sidebar :menu="menu"></v-sidebar>
  <div class="sidebar-backdrop" v-show="menu" @click="onBackdropClick"></div>
  <div class="wrap" @click.stop="refresh()" style="overflow-y: scroll;overflow-x: hidden;">
    <v-header :menu="menu" @toggle-menu="toggleMenu"></v-header>
    <v-content></v-content>
  </div>
</template>

<style scoped>
.wrap {
  flex-grow: 1;
}

.sidebar-backdrop {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 999;
  background: rgba(0, 0, 0, 0.4);
}

@media (max-width: 999px) {
  .sidebar-backdrop {
    display: block;
  }
}
</style>
