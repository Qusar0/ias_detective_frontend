<template>
  <div class="fssp-tab">
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
      <button @click="fetchFsspCases" class="retry-button">Повторить попытку</button>
    </div>

    <div v-else-if="!fsspCases.length && !loading" class="empty-list">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path
            d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"
        />
      </svg>
      Нет найденных исполнительных производств!
    </div>

    <div v-else class="fssp-list">
      <div
          v-for="fsspCase in fsspCases"
          :key="fsspCase.id"
          class="fssp-item"
      >
        <div class="fssp-header" @click="toggleCaseDetails(fsspCase.id)">
          <div class="fssp-main-info">
            <div class="fssp-fio">
              {{ fsspCase.fio }}
            </div>
            <div class="fssp-type" v-if="fsspCase.type_ip">
              {{ fsspCase.type_ip }}
            </div>
          </div>

          <div class="fssp-meta">
            <div class="fssp-summ" v-if="fsspCase.summ">
              {{ formatAmount(fsspCase.summ) }} ₽
            </div>
            <div class="fssp-status" v-if="fsspCase.end_cause">
              {{ fsspCase.end_cause }}
            </div>
          </div>

          <div class="fssp-expand">
            <svg
                :class="{ rotated: expandedCases.includes(fsspCase.id) }"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
            >
              <path
                  d="M201.4 342.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 274.7 86.6 137.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"
              />
            </svg>
          </div>
        </div>

        <div
            v-if="expandedCases.includes(fsspCase.id)"
            class="fssp-details"
        >
          <div v-if="loadingDetails[fsspCase.id]" class="details-loading">
            <div class="small-spinner"></div>
            <span>Загрузка деталей...</span>
          </div>

          <div v-else-if="detailsErrors[fsspCase.id]" class="details-error">
            <div class="error-icon">⚠️</div>
            <div class="error-message">{{ detailsErrors[fsspCase.id] }}</div>
            <button @click="retryFetchDetails(fsspCase.id)" class="retry-details-button">
              Повторить попытку
            </button>
          </div>

          <div v-else-if="caseDetails[fsspCase.id]" class="details-content">
            <div class="details-grid">
              <div class="detail-item">
                <span class="detail-label">Исполнительное производство:</span>
                <span class="detail-value">{{ caseDetails[fsspCase.id].ip || 'Не указано' }}</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">ФИО:</span>
                <span class="detail-value">{{ caseDetails[fsspCase.id].fio || 'Не указано' }}</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">РОСП:</span>
                <span class="detail-value">{{ caseDetails[fsspCase.id].rosp || 'Не указано' }}</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Тип ИП:</span>
                <span class="detail-value">{{ caseDetails[fsspCase.id].type_ip || 'Не указан' }}</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Сумма задолженности:</span>
                <span class="detail-value amount-highlight">{{ formatAmount(caseDetails[fsspCase.id].summ) }} ₽</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Конечная причина:</span>
                <span class="detail-value">{{ caseDetails[fsspCase.id].end_cause || 'Не указана' }}</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Пристав:</span>
                <span class="detail-value">{{ caseDetails[fsspCase.id].pristav || 'Не указан' }}</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Телефон пристава:</span>
                <span class="detail-value">{{ caseDetails[fsspCase.id].pristav_phones || 'Не указан' }}</span>
              </div>

              <div v-if="caseDetails[fsspCase.id].rekv" class="detail-item full-width">
                <span class="detail-label">Реквизиты:</span>
                <div class="rekv-content">
                  {{ caseDetails[fsspCase.id].rekv }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="fsspCases.length > 0" class="pagination-section">
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
      <div class="page-jump">
        <label for="page-jump-input">Перейти на страницу:</label>
        <input
            id="page-jump-input"
            type="number"
            v-model.number="pageJumpInput"
            @keyup.enter="jumpToPage"
            :min="1"
            :max="Math.ceil(totalCount / pageSize)"
            step="1"
            :disabled="loading"
            class="page-jump-input"
        >
        <button
            @click="jumpToPage"
            :disabled="loading || !pageJumpInput || !Number.isInteger(pageJumpInput) || pageJumpInput < 1 || pageJumpInput > Math.ceil(totalCount / pageSize)"
            class="page-jump-button"
        >
          Перейти
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
const fsspCases = ref([]);
const currentPage = ref(1);
const pageSize = ref(20);
const pageJumpInput = ref(null);

const expandedCases = ref([]);
const caseDetails = ref({});
const loadingDetails = ref({});
const detailsErrors = ref({});

const formatAmount = (amount) => {
  if (amount === null || amount === undefined) return '0';
  return new Intl.NumberFormat('ru-RU').format(amount);
};

const fetchFsspCases = async () => {
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

    const response = await fetch('/api/irbis/fssp/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    fsspCases.value = await response.json();
  } catch (err) {
    error.value = err.message || 'Произошла ошибка при загрузке данных';
    console.error('Error fetching FSSP cases:', err);
  } finally {
    loading.value = false;
  }
};

const fetchCaseDetails = async (caseId) => {
  if (caseDetails.value[caseId]) return;

  loadingDetails.value[caseId] = true;
  detailsErrors.value[caseId] = null;

  try {
    const response = await fetch(`/api/irbis/fssp/case_full/${caseId}`);

    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status}`);
    }

    caseDetails.value[caseId] = await response.json();
  } catch (err) {
    console.error('Error fetching case details:', err);
    detailsErrors.value[caseId] = err.message || 'Произошла ошибка при загрузке деталей';
  } finally {
    loadingDetails.value[caseId] = false;
  }
};

const retryFetchDetails = (caseId) => {
  delete caseDetails.value[caseId];
  delete detailsErrors.value[caseId];
  fetchCaseDetails(caseId);
};

const toggleCaseDetails = (caseId) => {
  const index = expandedCases.value.indexOf(caseId);
  if (index > -1) {
    expandedCases.value.splice(index, 1);
  } else {
    expandedCases.value.push(caseId);
    fetchCaseDetails(caseId);
  }
};

const changePage = (page) => {
  const maxPage = Math.ceil(props.totalCount / pageSize.value);
  if (page < 1 || page > maxPage) return;
  currentPage.value = page;
  fetchFsspCases();
};

const jumpToPage = () => {
  const maxPage = Math.ceil(props.totalCount / pageSize.value);
  if (pageJumpInput.value &&
      Number.isInteger(pageJumpInput.value) &&
      pageJumpInput.value >= 1 &&
      pageJumpInput.value <= maxPage) {
    changePage(pageJumpInput.value);
    pageJumpInput.value = null;
  }
};

watch(() => props.isActive, (isActive) => {
  if (isActive && fsspCases.value.length === 0 && props.queryId) {
    fetchFsspCases();
  }
});

onMounted(() => {
  if (props.isActive && props.queryId) {
    fetchFsspCases();
  }
});
</script>

<style scoped>
.fssp-tab {
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

/* FSSP List */
.fssp-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.fssp-item {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.fssp-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #eee;
}

.fssp-header:hover {
  background-color: #f8f9fa;
}

.fssp-main-info {
  flex: 1;
}

.fssp-fio {
  font-weight: 600;
  font-size: 16px;
  color: #333;
  margin-bottom: 4px;
}

.fssp-type {
  font-size: 14px;
  color: #666;
}

.fssp-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  margin-right: 20px;
}

.fssp-summ {
  font-size: 16px;
  font-weight: 600;
  color: #4400ed;
}

.fssp-status {
  font-size: 12px;
  background: #e9ecef;
  color: #495057;
  padding: 2px 6px;
  border-radius: 3px;
}

.fssp-expand svg {
  width: 16px;
  height: 16px;
  fill: #666;
  transition: transform 0.2s;
}

.fssp-expand svg.rotated {
  transform: rotate(180deg);
}

/* Case Details */
.fssp-details {
  border-top: 1px solid #eee;
  background: #f8f9fa;
}

.details-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px;
}

.small-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #4400ed;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.details-content {
  padding: 20px;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-label {
  font-weight: 600;
  color: #666;
  font-size: 12px;
  text-transform: uppercase;
}

.detail-value {
  font-size: 14px;
  color: #333;
}

.detail-value.amount-highlight {
  font-size: 16px;
  font-weight: 600;
  color: #4400ed;
}

.rekv-content {
  background: white;
  padding: 12px;
  border-radius: 4px;
  border-left: 3px solid #4400ed;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  white-space: pre-wrap;
}

/* Pagination */
.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
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

/* Details Error Styles */
.details-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  margin: 10px 0;
}

.error-icon {
  font-size: 24px;
}

.error-message {
  color: #dc2626;
  font-weight: 500;
  text-align: center;
}

.retry-details-button {
  background: #dc2626;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.retry-details-button:hover {
  background: #b91c1c;
}

/* Responsive */
@media (max-width: 768px) {
  .fssp-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .fssp-meta {
    align-items: flex-start;
    margin-right: 0;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .pagination-section {
    flex-direction: column;
    gap: 10px;
  }

  .page-jump {
    width: 100%;
    justify-content: center;
  }
}

.page-jump {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-jump label {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
}

.page-jump-input {
  width: 70px;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
}

.page-jump-input:focus {
  outline: none;
  border-color: #4400ed;
}

.page-jump-button {
  background: #4400ed;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.page-jump-button:hover:not(:disabled) {
  background: #3300cc;
}

.page-jump-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
