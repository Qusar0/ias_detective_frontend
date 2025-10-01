<template>
  <div class="tax-arrears-tab">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <div class="loading-text">Загрузка данных...</div>
    </div>

    <div v-else-if="error" class="error-container">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path
            d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"
        />
      </svg>
      <div class="error-text">{{ error }}</div>
      <button @click="fetchTaxArrears" class="retry-button">Повторить попытку</button>
    </div>

    <div v-else-if="!taxArrears.length && !loading" class="empty-list">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path
            d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"
        />
      </svg>
      Нет найденных налоговых задолженностей!
    </div>

    <div v-else class="tax-arrears-list">
      <div
          v-for="(arrear, index) in taxArrears"
          :key="index"
          class="arrear-item"
      >
        <div class="arrear-content">
          <div class="arrear-main-section">
            <div class="arrear-main-info">
              <div class="provider">
                {{ arrear.provider }}
              </div>
              <div class="amount">
                <span class="amount-value">{{ formatAmount(arrear.value) }}</span>
                <span class="currency">{{ arrear.money_name }}</span>
              </div>
            </div>

            <div v-if="arrear.payment && arrear.payment.length > 0" class="arrear-expand" @click="toggleArrearDetails(index)">
              <svg
                  :class="{ rotated: expandedArrears.includes(index) }"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
              >
                <path
                    d="M201.4 342.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 274.7 86.6 137.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"
                />
              </svg>
            </div>
          </div>

          <div v-if="arrear.info && arrear.info.length > 0" class="arrear-info-section">
            <div class="section-title">Информация о задолженности:</div>
            <div class="info-list">
              <div
                  v-for="(infoItem, infoIndex) in arrear.info"
                  :key="infoIndex"
                  class="info-item"
              >
                {{ infoItem }}
              </div>
            </div>
          </div>
        </div>

        <div
            v-if="expandedArrears.includes(index) && arrear.payment && arrear.payment.length > 0"
            class="arrear-details"
        >
          <div class="payment-section">
            <div class="section-title">Реквизиты получателя:</div>
            <div class="payment-list">
              <div
                  v-for="(paymentItem, paymentIndex) in arrear.payment"
                  :key="paymentIndex"
                  class="payment-item"
              >
                <div class="payment-row">
                  <span class="payment-label">{{ paymentItem.name }}:</span>
                  <span class="payment-value">{{ paymentItem.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="taxArrears.length > 0" class="pagination-section">
      <div class="pagination-info">
        Страница {{ currentPage }} из {{ Math.ceil(totalCount / pageSize) }}
        (всего: {{ totalCount }})
      </div>
      <div class="pagination-controls">
        <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage <= 1 || loading"
            class="page-button"
        >
          ← Предыдущая
        </button>
        <span class="page-display">{{ currentPage }}</span>
        <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage >= Math.ceil(totalCount / pageSize) || loading"
            class="page-button"
        >
          Следующая →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';

const props = defineProps({
  queryId: {
    type: [String, Number],
    required: false
  },
  isActive: {
    type: Boolean,
    default: false
  },
  totalCount: {
    type: Number,
    default: 0
  }
});

const loading = ref(false);
const error = ref(null);
const taxArrears = ref([]);
const currentPage = ref(1);
const pageSize = ref(20);
const expandedArrears = ref([]);

const formatAmount = (amount) => {
  if (amount === null || amount === undefined) return '0';
  return new Intl.NumberFormat('ru-RU').format(amount);
};

const fetchTaxArrears = async () => {
  if (!props.queryId) {
    error.value = 'Query ID не предоставлен';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const requestBody = {
      query_id: props.queryId,
      page: currentPage.value,
      size: pageSize.value
    };

    const response = await fetch('/api/irbis/tax_arrears/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    taxArrears.value = await response.json();
  } catch (err) {
    error.value = err.message || 'Произошла ошибка при загрузке данных';
    console.error('Error fetching tax arrears:', err);
  } finally {
    loading.value = false;
  }
};

const toggleArrearDetails = (index) => {
  const expandedIndex = expandedArrears.value.indexOf(index);
  if (expandedIndex > -1) {
    expandedArrears.value.splice(expandedIndex, 1);
  } else {
    expandedArrears.value.push(index);
  }
};

const changePage = (page) => {
  if (page < 1) return;
  currentPage.value = page;
  expandedArrears.value = [];
  fetchTaxArrears();
};

watch(() => props.isActive, (isActive) => {
  if (isActive && taxArrears.value.length === 0 && props.queryId) {
    fetchTaxArrears();
  }
});

onMounted(() => {
  if (props.isActive && props.queryId) {
    fetchTaxArrears();
  }
});
</script>

<style scoped>
.tax-arrears-tab {
  padding: 15px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Loading and Error States */
.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4400ed;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-text {
  color: #666;
  font-size: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-container svg {
  width: 48px;
  height: 48px;
  fill: #dc3545;
  margin-bottom: 16px;
}

.error-text {
  color: #dc3545;
  font-size: 16px;
  margin-bottom: 20px;
}

.retry-button {
  background: #4400ed;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.retry-button:hover {
  background: #3300cc;
}

.empty-list {
  color: #8a6d3b;
  background: #fce7c4;
  border: 1px solid #fad292;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  padding: 0 20px;
  border-radius: 4px;
  margin: 20px 0;
}

.empty-list svg {
  height: 18px;
  margin-right: 7px;
  fill: #8a6d3b;
}

/* Tax Arrears List */
.tax-arrears-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.arrear-item {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.arrear-content {
  padding: 20px;
}

.arrear-main-section {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.arrear-main-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  margin-right: 20px;
}

.provider {
  font-weight: 600;
  font-size: 16px;
  color: #333;
}

.amount {
  display: flex;
  gap: 8px;
  align-items: baseline;
}

.amount-value {
  font-size: 20px;
  font-weight: 700;
  color: #4400ed;
}

.arrear-expand {
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.arrear-expand:hover {
  background-color: #f8f9fa;
}

.arrear-expand svg {
  width: 16px;
  height: 16px;
  fill: #666;
  transition: transform 0.2s;
}

.arrear-expand svg.rotated {
  transform: rotate(180deg);
}

.arrear-details {
  border-top: 1px solid #eee;
  background: #f8f9fa;
  padding: 15px 20px;
}

.currency {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.section-title {
  font-weight: 600;
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
  text-transform: uppercase;
}

.arrear-info-section {
  margin-top: 15px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  background: white;
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  border-left: 3px solid #4400ed;
}

.payment-section {
}

.payment-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.payment-item {
  background: white;
  padding: 10px 12px;
  border-radius: 4px;
  border-left: 3px solid #4400ed;
}

.payment-row {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

.payment-label {
  font-weight: 400;
  color: #666;
  min-width: 180px;
}

.payment-value {
  color: #333;
  flex: 1;
}

/* Pagination */
.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 15px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.pagination-info {
  font-size: 14px;
  color: #666;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-button {
  background: #4400ed;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.page-button:hover:not(:disabled) {
  background: #3300cc;
}

.page-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.page-display {
  font-weight: 600;
  color: #333;
  padding: 0 10px;
}

/* Responsive */
@media (max-width: 768px) {
  .arrear-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .payment-row {
    flex-direction: column;
    gap: 4px;
  }

  .payment-label {
    min-width: auto;
  }

  .pagination-section {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
