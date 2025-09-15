<script>
import VSidebar from '../components/VSidebar.vue';
import VHeader from '../components/VHeader.vue';
import VIrbis from '../components/VFindIrbis.vue';
import {menu, refresh} from '../use/index';

export default {
  components: {
    VSidebar,
    VHeader,
    VIrbis
  },
  methods: {
    toggleMenu(bool) {
      this.menu = bool;
    }
  },
  setup() {
    return {refresh, menu};
  }
};
</script>

<template>
  <v-sidebar :menu="menu" @click.stop="refresh()"></v-sidebar>
  <div class="wrap" @click.stop="refresh()" style="overflow-y: scroll;overflow-x: hidden;">
    <v-header :menu="menu" @toggle-menu="toggleMenu"></v-header>
    <v-irbis></v-irbis>
  </div>
</template>

<style scoped>
.wrap {
  flex-grow: 1;
}
</style>
