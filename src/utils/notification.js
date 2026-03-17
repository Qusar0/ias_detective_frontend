import { computed, reactive, ref } from 'vue';

export const events = reactive(ref([]));
export const bell_animation = reactive(ref(false));
export const bell_opened = reactive(ref(false));

let timeout = 0;

export function getNotificationSound() {
  // notificationSound.play()
  let audio = document.querySelector('#notification-sound');

  audio.pause();
  audio.currentTime = 0;
  audio.play();

  bell_animation.value = false;
  bell_animation.value = true;

  clearTimeout(timeout);

  timeout = setTimeout(() => {
    bell_animation.value = false;

  }, 1000);
}

export function get_events() {
  fetch(`/api/users/get_events`, {
    method: 'GET',
    credentials: 'include'
  })
      .then((response) => {
        if (response?.status === 401) {
          return Promise.reject({
            message: 'Token has expired'
          });
        }
        return response.json();
      })
      .then((data) => {
        events.value = Object.values(data) ?? [];
      });
}

export const has_notifications = computed(() => {
  return Boolean(events.value.filter(event => event?.event_status === 'unseen')?.length);
});
