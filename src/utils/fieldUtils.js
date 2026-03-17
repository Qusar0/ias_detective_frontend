import { keys_list } from '../use/index';

export const clearKeysList = () => {
  keys_list.value.prohibited_site.list = [];
  keys_list.value.keyword.list = [];
  keys_list.value.minus.list = [];
  keys_list.value.plus.list = [];
};

export const clearCheckboxes = (chbox, defaultValues = {}) => {
  Object.keys(chbox).forEach(key => {
    chbox[key] = defaultValues[key] || false;
  });
};