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
import VConfirm from '../pages/VConfirm.vue';
import VResetPassword from '../pages/VResetPassword.vue';
import VConfirmTelegram from '../pages/VConfirmTelegram.vue';
import VQuery from '../pages/VQuery.vue';
import VFindByIrbis from '../pages/VFindByIrbis.vue';

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
    path: '/reset-password',
    name: 'ResetPassword',
    component: VResetPassword
  },
  {
    path: '/connect_tg',
    name: 'ConnectTelegram',
    component: VConfirmTelegram
  },
  {
    path: '/query',
    name: 'Query',
    component: VQuery
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
    path: '/find-by-irbis',
    name: 'VFindByIrbis',
    component: VFindByIrbis
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
    redirect: {
      path: '/'
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to, from) => {

  if (isAuthorized.value === undefined) {
    try {
      if (to.path !== '/confirm-email' && to.path !== '/reset-password' && to.path !== '/connect_tg') {
        let response = await fetch(`/api/users/is_authenticated`, {
          method: 'GET',
          credentials: 'include'
        });
        console.log('response', response);
        console.log('to, from', to, from);
        if (response?.status === 401) {
          isAuthorized.value = false;
          console.log('error', {
            message: 'Token has expired'
          });
        } else {
          isAuthorized.value = true;
        }
      } else {
        isAuthorized.value = true;
      }
    } finally {
      if (isAuthorized.value === true) return (to.name === 'Login' ? {name: 'Home'} : true);
      else return {name: 'Login'};
    }
  }

  if (to.name === 'Login' && isAuthorized.value === true) return {name: 'Home'};
  return true;
});

export default router;