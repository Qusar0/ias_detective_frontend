<script>
import VSidebar from '../components/VSidebar.vue'
import VHeader from '../components/VHeader.vue'
import VFindEmail from '../components/VFindEmail.vue'
import { refresh, menu } from '../use/index'
export default {
    components: {
        VSidebar,
        VHeader,
        VFindEmail
    },
    methods: {
        toggleMenu(bool) {
            this.menu = bool
        }
    },
    setup() {
        return { refresh, menu }
    }
}
</script>

<template>
    <v-sidebar :menu="menu" @click.stop="refresh()"></v-sidebar>
    <div class="wrap" @click.stop="refresh()" style="overflow-y: scroll;overflow-x: hidden;">
        <v-header :menu="menu" @toggle-menu="toggleMenu"></v-header>
        <v-find-email></v-find-email>
    </div>
</template>

<style scoped>
.wrap {
    flex-grow: 1;
}
</style>
