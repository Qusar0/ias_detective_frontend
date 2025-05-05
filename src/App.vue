<script>
import { h } from 'vue';
import { toast } from 'vue3-toastify';
import { getNotificationSound, get_events, events } from './utils/notification';
import ToastifyMessage from "./components/UI/ToastifyMessage.vue"
import { user_name, user_created, set_user_balance } from './use';

export default {
    components: {
        ToastifyMessage,
    },
    setup() {
        return { getNotificationSound, get_events, events, user_name, user_created, set_user_balance }
    },
    methods: {
        handleGreeting(event) {
          let data = JSON.parse(event.data);
          console.log('greeting', data);
          if (data.event_type == 'balance') {
            this.set_user_balance(data.balance);
            return;
          }
          
          data.message.task_created_at = new Date(data.message.task_created_at).minus('minute', new Date().getTimezoneOffset()).format('Y-m-d h:i:s');

          this.events.unshift(data)
          this.getNotificationSound();
          this.notify(data ?? {});
        },
        notify(event_item) {
            
            // const id = toast.loading(
            //     'Please wait...',
            //     {
            //         position: toast.POSITION.TOP_RIGHT,
            //     },
            //     );
                
            //     setTimeout(() => {
            //         toast.update(id, {
            //             render: ToastifyMessage,
            //     });
            // }, 1);

            toast(
                ({ toastProps }) => h(ToastifyMessage, { toastProps, event_data: {
                                        event_id: event_item?.event_id,
                                        event_status: event_item?.event_status,
                                        task_id: event_item?.message?.task_id,
                                        task_category: event_item?.message?.task_category,
                                        task_title: event_item?.message?.task_title,
                                        task_status: event_item?.message?.status,
                                        task_created_at: event_item?.message?.task_created_at,
                                    } }),
                {
                    autoClose: 3000,
                    closeButton: true,
                    isLoading: false,
                },
            );
        },
    },
    mounted() {
        this.get_events();

        const channel = btoa(this.user_name + this.user_created + '');
        console.log("Connecting to channel:", channel);
        this.source = new EventSource(`/api/sse/${channel}`);

        this.source.addEventListener("open", () => {
            console.log("✅ SSE connection established");
        });

        this.source.addEventListener("message", this.handleGreeting);

        this.source.addEventListener("error", (event) => {
            console.error("❌ SSE connection error:", event);

            if (this.source.readyState === EventSource.CLOSED) {
                console.warn("🔌 SSE connection was closed by the server");
            } else if (this.source.readyState === EventSource.CONNECTING) {
                console.info("🔄 SSE is reconnecting...");
            }
        });
    },
    beforeUnmount() {
        if (this.source) {
            this.source.removeEventListener("message", this.handleGreeting);
            this.source.close();
        }
    },
}

</script>

<template>
    <router-view></router-view>
</template>

<style scoped>

.wrap {
    flex-grow: 1;
}
#app {
    position: relative;
}
</style>
