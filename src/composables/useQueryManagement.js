import {ref} from 'vue';
import dayjs from "dayjs"
import {isAuthorized} from '../use/index';
import router from '../router/router.js';

export function useQueryManagement(category) {
  const query_list = ref([]);
  const query_list_loading = ref(true);
  const news_count = ref(0);

  const getUserQueries = (page = 1) => {
    fetch(`/api/queries/query_getter?query_category=${category}&page=${page - 1}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })
        .then((response) => {
          if (response?.status === 401) {
            isAuthorized.value = false;
            router.push('login');
            return Promise.reject({
              message: 'Token has expired'
            });
          }
          return response.json();
        })
        .then((response) => {
          if (response) {
            query_list.value = response.map(query => {
              query.old_query_unix_date = query.query_unix_date;
              const createdAt = dayjs(query.query_created_at, "YYYY/MM/DD HH:mm:ss");
              const adjusted = createdAt.subtract(new Date().getTimezoneOffset(), "minute");
              query.query_created_at = adjusted.format("YYYY-MM-DD HH:mm:ss");
              return query;
            });
          }
        })
        .catch((error) => {
          console.log('error', error);
        })
        .finally(() => {
          query_list_loading.value = false;

          let hasPendingQuery = query_list.value.find(query => (query.query_status === 'pending')) !== undefined;
          if (hasPendingQuery) {
            setTimeout(() => {
              getUserQueries();
            }, 1000 * 15);
          }
        });
  };

  const getUserQueriesCount = () => {
    fetch(`/api/queries/queries_count?query_category=${category}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })
        .then((response) => {
          if (response?.status === 401) {
            isAuthorized.value = false;
            router.push('login');
            return Promise.reject({
              message: 'Token has expired'
            });
          }
          return response.json();
        })
        .then((response) => {
          news_count.value = response.count;
        })
        .catch((error) => {
          console.log('error', error);
        });
  };

  const deleteQuery = (id, updateTimestamp) => {
    fetch(`/api/queries/delete_query?query_id=${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
        .then(() => {
          query_list_loading.value = true;
          getUserQueriesCount();
          getUserQueries();
          if (updateTimestamp) updateTimestamp();
          if (news_count.value === 1) {
            window.location.reload();
          }
        })
        .catch(() => {
          console.log('unable to delete query', id);
        });
  };

  const downloadQuery = (title, id, query) => {
    query.downloading = true;
    fetch(`/api/queries/download_query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        query_id: id
      })
    })
        .then((response) => {
          if (response?.status === 401) {
            isAuthorized.value = false;
            router.push('login');
            return Promise.reject({
              message: 'Token has expired'
            });
          }
          return response.blob();
        })
        .then((response) => {
          let blob = new Blob([response]);
          let link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = `${title}.html`;
          link.click();
          getUserQueries();
        })
        .catch((error) => {
          console.log('error', error);
        })
        .finally(() => {
          query.downloading = false;
        });
  };

  return {
    query_list,
    query_list_loading,
    news_count,
    getUserQueries,
    getUserQueriesCount,
    deleteQuery,
    downloadQuery
  };
}