import { ref } from 'vue';

export function useTimestamp() {
  const current_timestamp = ref(new Date().valueOf());

  const update_current_timestamp = () => {
    current_timestamp.value = new Date().valueOf();
    setTimeout(() => {
      update_current_timestamp();
    }, 1000);
  };

  return {
    update_current_timestamp
  };
}