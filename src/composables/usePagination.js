import {ref} from 'vue';

export function usePagination() {
  const selected_page = ref(1);

  const set_selected_page = (page, onPageChange) => {
    selected_page.value = parseInt(page);
    if (onPageChange) onPageChange();
  };

  return {
    selected_page,
    set_selected_page
  };
}