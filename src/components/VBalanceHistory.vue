<template>
  <div class="content">
    <VLoader v-if="loading" />

    <div class="history-wrap">
      <div class="section-title">История баланса</div>

      <div v-if="!loading && !items.length" class="empty-state">
        <i class="fa-solid fa-clock-rotate-left"></i>
        <p>История транзакций пуста</p>
      </div>

      <div v-if="!loading && items.length" class="history-list">
        <div
          v-for="item in items"
          :key="item.id"
          class="history-item"
        >
          <div class="type-badge" :class="'badge-' + item.transaction_type">
            <i :class="typeIcon(item.transaction_type)"></i>
          </div>
          <div class="item-main">
            <span class="item-type-label">{{ typeLabel(item.transaction_type) }}</span>
            <span v-if="item.query_title" class="item-query">{{ item.query_title }}</span>
          </div>
          <div class="item-date">{{ formatDate(item.timestamp) }}</div>
          <div class="item-amount" :class="'amount-' + item.transaction_type">
            {{ amountPrefix(item.transaction_type) }}{{ item.amount.toFixed(2) }} ₽
          </div>
        </div>
      </div>

      <VPagination
        v-if="!loading && totalPages > 1"
        :selected_page="currentPage"
        :general_count="total"
        :set_selected_page="goToPage"
        :updateList="fetchHistory"
        style="margin-top: 16px;"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import VLoader from './UI/VLoader.vue';
import VPagination from './UI/VPagination.vue';

const items = ref([]);
const total = ref(0);
const totalPages = ref(0);
const currentPage = ref(1);
const loading = ref(true);

const fetchHistory = async () => {
  loading.value = true;
  try {
    const res = await fetch(`/api/users/balance_history?page=${currentPage.value - 1}&size=20`, {
      credentials: 'include'
    });
    if (res.status === 401) {
      window.location.href = '/login';
      return;
    }
    const data = await res.json();
    items.value = data.items;
    total.value = data.total;
    totalPages.value = data.total_pages;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const goToPage = (page) => {
  currentPage.value = page;
  fetchHistory();
};

const typeLabel = (type) => {
  const labels = { top_up: 'Пополнение', payment: 'Списание', refund: 'Возврат' };
  return labels[type] ?? type;
};

const typeIcon = (type) => {
  const icons = {
    top_up: 'fa-solid fa-arrow-trend-up',
    payment: 'fa-solid fa-arrow-trend-down',
    refund: 'fa-solid fa-rotate-left'
  };
  return icons[type] ?? 'fa-solid fa-circle';
};

const amountPrefix = (type) => (type === 'payment' ? '−' : '+');

const formatDate = (timestamp) => new Date(timestamp).format('d.m.Y h:i');

onMounted(fetchHistory);
</script>

<style scoped>
.content {
  padding: 20px;
}

.history-wrap {
  max-width: 900px;
  margin: 0 auto;
}

.section-title {
  font-size: 22px;
  font-weight: 600;
  line-height: 1;
  margin-bottom: 16px;
}

.history-list {
  background: white;
  border-radius: 5px;
  overflow: hidden;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.12s;
}

.history-item:last-child {
  border-bottom: none;
}

.history-item:hover {
  background: #fafafa;
}

.type-badge {
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  color: white;
}

.badge-top_up {
  background: rgb(26, 179, 148);
}

.badge-payment {
  background: #ed5565;
}

.badge-refund {
  background: #3b5998;
}

.item-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.item-type-label {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.item-query {
  font-size: 12px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-date {
  flex-shrink: 0;
  font-size: 12px;
  color: #aaa;
  white-space: nowrap;
}

.item-amount {
  flex-shrink: 0;
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
  min-width: 90px;
  text-align: right;
}

.amount-top_up {
  color: rgb(26, 179, 148);
}

.amount-payment {
  color: #ed5565;
}

.amount-refund {
  color: #3b5998;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #bbb;
}

.empty-state i {
  font-size: 40px;
  margin-bottom: 14px;
  display: block;
}

.empty-state p {
  font-size: 15px;
}

@media (max-width: 600px) {
  .section-title {
    font-size: 16px;
  }

  .item-date {
    display: none;
  }

  .item-amount {
    min-width: 70px;
    font-size: 13px;
  }

  .type-badge {
    width: 32px;
    height: 32px;
    font-size: 13px;
  }
}
</style>
