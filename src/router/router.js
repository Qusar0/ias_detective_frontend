import { createRouter, createWebHistory } from 'vue-router';
import VMain from '../pages/VMain.vue';
import VAuthorize from '../pages/VAuthorize.vue';
import VPayment from '../pages/VPayment.vue';
import VSettings from '../pages/VSettings.vue';
import VSupport from '../pages/VSupport.vue';
import VFindByNumber from '../pages/VFindByNumber.vue';
import VFindByTelegram from '../pages/VFindByTelegram.vue';
import VFindByEmail from '../pages/VFindByEmail.vue';
import VFindByCompany from '../pages/VFindByCompany.vue';
import { isAuthorized } from '../use/index';
import { reactive, ref } from 'vue';
import VConfirm from "../pages/VConfirm.vue";

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: VAuthorize
    },
    {
        path: '/confirm-email',
        name: 'Confirm',
        component: VConfirm
    },
    {
        path: '/payment',
        name: 'Payment',
        component: VPayment
    },
    {
        path: '/',
        name: 'Home',
        component: VMain
    },
    {
        path: '/find-by-number',
        name: 'FindByNumber',
        component: VFindByNumber
    },
    {
        path: '/find-by-telegram',
        name: 'FindByTelegram',
        component: VFindByTelegram
    },
    {
        path: '/find-by-email',
        name: 'VFindByEmail',
        component: VFindByEmail
    },
    {
        path: '/find-by-company',
        name: 'VFindByCompany',
        component: VFindByCompany
    },
    {
        path: '/settings',
        name: 'Settings',
        component: VSettings
    },
    {
        path: '/support',
        name: 'Support',
        component: VSupport
    },
    {
        path: '/:pathMatch(.*)*',
        // name: 'not-found',
        // component: NotFound,
        redirect: {
            path: "/"
        }
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach(async (to, from) => {


    if (isAuthorized.value == undefined) {
        try {
            if (to.path !== '/confirm-email') {
                // let response = await fetch(`/api/is_authenticated`, {
                let response = await fetch(`/api/is_authenticated`, {
                    method: "GET",
                    credentials: "include",
                })
                console.log('response', response);
                console.log('to, from', to, from);
                if (response?.status == 401) {
                    isAuthorized.value = false;
                    console.log('error', {
                        message: "Token has expired"
                    });
                }
                else {
                    isAuthorized.value = true;
                }
            } else {
                isAuthorized.value = true;
            }
        }
        finally {
            if (isAuthorized.value === true) return (to.name === 'Login' ? { name: 'Home' } : true);
            else return { name: 'Login' };
        }
    }

    if (to.name === 'Login' && isAuthorized.value == true) return { name: 'Home' };
    return true;
});

export default router;