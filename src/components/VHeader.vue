<template>
    <div class="header">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 30 20"
            @click="$emit('toggle-menu', !menu)"
        >
            <rect width="30" height="4" rx="2" />
            <rect y="8" width="30" height="4" rx="2" />
            <rect y="16" width="30" height="4" rx="2" />
        </svg>
        <div class="nav">
            <button class="item-btn btn">
                <router-link to="/payment" style="text-decoration: none;color: white;">Пополнить</router-link>
            </button>
            <div style="font-size: 13.3px;margin-right: 15px;">
              <b>{{ user_balance.toFixed(1) }}</b>
              руб.
            </div>
            <div style="position: relative;z-index: 99;">
                <i
                    class="fa-solid fa-bell"
                    :class="{ 'has-notifications': has_notifications, 'bell-animation': bell_animation, }"
                    style="margin-right: 15px;"
                    @click.stop="bell_opened = !bell_opened"
                ></i>
                <div
                    v-if="events.length"
                    class="notifications scrollbar"
                    :class="{ open: bell_opened }"
                    @click.stop
                >
                    <div
                        v-for="event_item in events"
                        :key="event_item"
                        class="notification"
                        @mouseenter="seen_notification(event_item)"
                    >
                        <div :class="`seen_dot ${event_item?.event_status == 'seen' ? 'seen-animation' : ''}`"></div>
                        <ToastifyMessage :event_data="{
                            event_id: event_item?.event_id,
                            event_status: event_item?.event_status,
                            task_category: event_item?.message?.task_category,
                            task_title: event_item?.message?.task_title,
                            task_status: event_item?.message?.status,
                            task_created_at: event_item?.message?.task_created_at,
                        }" />
                    </div>
                </div>
            </div>
            <!--<img src="../assets/img/avatar.jpg" alt="avatar" class="avatar">-->
            <i
                class="fa-solid fa-user-tie"
                style="font-size: 22px;"
            ></i>
            <div
                v-if="user_name"
                class="full_name"
            >
              {{ user_name }}
            </div>
            <img
                src="../assets/img/arrow-down.png"
                alt=""
                class="dropdown"
                @click.stop="dropdown = !dropdown"
            >
            <div
                v-show="dropdown"
                class="pos-a dropdown-menu"
                style="z-index: 2;"
                @click.stop
            >
                <span>
                  <i class="fa-solid fa-gear"></i>
                  <router-link to="/settings">Настройки</router-link>
                </span>
                <span class="logout" @click="logout()">
                  <i class="fa-solid fa-arrow-right-from-bracket"></i>
                  Выход
                </span>
            </div>
        </div>
    </div>
</template>

<script>
import { isAuthorized, dropdown, user_name, user_balance, get_user_balance } from '../use/index'
import { getNotificationSound, bell_animation, has_notifications, bell_opened, events } from '../utils/notification';
import ToastifyMessage from "./UI/ToastifyMessage.vue"

export default {
    components: {
        ToastifyMessage,
    },
    setup() {
        return {
          isAuthorized,
          dropdown,
          user_name,
          getNotificationSound,
          bell_animation,
          has_notifications,
          bell_opened,
          events,
          user_balance,
          get_user_balance
        }
    },
    props: {
        menu: {
            type: Boolean,
            required: true
        }
    },
    methods: {
        seen_notification(event_item) {

            if (event_item.event_status == 'seen') return;

            fetch(`/api/change_event_status`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    event_id: event_item.event_id + "",
                }),

            })
                .then((response) => {
                    if (response?.status == 401) {
                        return Promise.reject({
                            message: "Token has expired"
                        });
                    }
                    return response.json()
                })
                .then((data) => {
                    console.log('change_event_status', data);
                })
                .catch(error => console.error(error))


            event_item.event_status = 'seen';
        },
        logout() {
            fetch(`/api/v1/auth/logout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                }),
            })
                .then((response) => {
                    if (response.status == 200) {
                        this.isAuthorized = false
                        localStorage.removeItem('user_created')
                        localStorage.removeItem('user_id')
                        localStorage.removeItem('user_name')
                        this.$router.push('login')
                        return;
                    }
                })
                .catch((error) => {
                    console.log('error', error);
                })
        }
    },
    mounted() {
        this.get_user_balance()
    }
}

</script>

<style scoped>
.header {
    display: flex;
    align-items: center;
    height: 50px;
    background: white;
}

.header svg {
    margin-left: 16px;
    cursor: pointer;
    transition: .2s;

    background-color: #2f4050;
    fill: white;
    padding: 6px 0 6px;
    height: 25px;
    width: 33px;
    border-radius: 4px;
}

.nav {
    margin-left: auto;
    margin-right: 15px;
    display: flex;
    align-items: center;
    position: relative;
}

.pos-a {
    position: absolute;
    top: calc(100% + 9px);
    right: 0;
    min-width: 210px;
    border: 1px solid #bbb;
}

.dropdown-menu span a {
    padding: 0 !important;
}

.dropdown-menu span a,
.dropdown-menu span {
    color: #333;
    text-decoration: none;
    background: white;
    height: 33px;
    padding: 0 8px;
    display: flex;
    align-items: center;
    line-height: 1;
    cursor: pointer;
    padding-left: 48px;

    overflow: hidden;
}

/*.dropdown-menu span {
    padding-left: 22%;
}*/
.dropdown-menu span i {
    margin-right: 10px;
}

.dropdown-menu span:not(.dropdown-menu span:last-child) {
    border-bottom: 1px solid #bbb;
}

.dropdown-menu span:hover a,
.dropdown-menu span:hover {
    color: #9300FF;
}

.dropdown-menu span.logout:hover {
    color: red;
}

.nav .avatar {
    object-fit: cover;
    border-radius: 50%;
    height: 35px;
    width: 35px;
    cursor: pointer;
}

.nav .full_name {
    margin-left: 10px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
}

.nav .dropdown {
    width: 12px;
    margin-left: 10px;
    padding-top: 4px;
    cursor: pointer;
}




.fa-bell {
    cursor: pointer;
    font-size: 18px;
    position: relative;
    transform: rotate(0deg);
}

.fa-bell.bell-animation {
    animation: abanico 1000ms ease-in-out infinite;
    transform-origin: top;
}

.fa-bell.has-notifications::after {
    content: '';
    font-size: 10px;
    position: absolute;
    top: 0;
    width: 0.5em;
    height: 0.5em;
    background: red;
    border-radius: 50%;
    border: 1px solid #fff;
    right: -1px;
}

/* .bell-bot-anim {
animation: badalo 1000ms ease-in-out;
}

.new-not {
animation: popup 500ms forwards;
} */

@keyframes abanico {
    0% {
        transform: rotate(0deg);
    }

    7.5% {
        transform: rotate(25deg);
    }

    30% {
        transform: rotate(-25deg);
    }

    45% {
        transform: rotate(15deg);
    }

    58% {
        transform: rotate(-10deg);
    }

    70% {
        transform: rotate(5deg);
    }

    87.5% {
        transform: rotate(-2deg);
    }

    100% {
        transform: rotate(0deg);
    }
}

/* @keyframes badalo {
    15% {
        transform: translateX(-25px) rotate(7deg);
    }
    32.5% {
        transform: translateX(10px) rotate(-7deg);
    }
    50% {
        transform: translateX(-15px) rotate(7deg);
    }
    65% {
        transform: translateX(5px) rotate(-7deg);
    }
    80% {
        transform: translateX(-15px) rotate(7deg);
    }
    90% {
        transform: translateX(0px) rotate(-7deg);
    }
} */

.notification {
    display: flex;
    flex-direction: column;
    color: #333;
    justify-content: space-evenly;
    height: 60px;
    padding: 4px 10px;
    transition: background .15s;
    position: relative;
}

.seen_dot {
    position: absolute;
    left: 6px;
    top: 6px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #2f46ad;
    opacity: 1;
}

@keyframes seen_scale {
    20% {
        transform: scale3d(1.1, 1.1, 1);
        -moz-transform: scale3d(1.1, 1.1, 1);
    }

    99% {
        transform: scale3d(0, 0, 0);
        -moz-transform: scale3d(0, 0, 0);
    }

    100% {
        display: none;
        -moz-display: none;
    }
}

.seen_dot.seen-animation {
    animation: seen_scale .3s ease-in-out .9s both;
    -webkit-animation: seen_scale .3s ease-in-out .9s both;
    -moz-animation: seen_scale .3s ease-in-out .9s both;
    -ms-animation: seen_scale .3s ease-in-out .9s both;
}

@-moz-document url-prefix() {
    .seen_dot.seen-animation {
        transition: 1.2s;
        transform: scale3d(0, 0, 0);
        -moz-transform: scale3d(0, 0, 0);
        animation: none;
    }

    /* Add CSS here */
}

.notification:hover {
    background: #0000000a;
}

.notifications {
    background: white;
    width: 300px;
    height: 0px;
    position: absolute;
    right: -15px;
    top: calc(100% + 20px);
    border-radius: 6px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.10);
    transition: .15s;
}

.notifications.open {
    height: 420px;
}


.item-btn {
    background: rgb(26, 179, 148);
    font-size: 13px;
    border: none;
    height: 25px;
    margin-right: 10px;
}

.item-btn:hover {
    background: rgb(22, 144, 119);
}

</style>