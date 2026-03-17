<template>
  <div class="bankruptcy-tab">
    <div class="filters-section">
      <div class="filters-card">
        <h3 class="filters-title">Фильтры поиска</h3>

        <div class="filters-grid">
          <div class="filter-group">
            <label class="filter-label">Тип поиска:</label>
            <div class="checkboxes-container">
              <label class="checkbox-item">
                <input
                    type="radio"
                    :value="null"
                    v-model="filters.search_type"
                >
                <span>Все данные</span>
              </label>
              <label class="checkbox-item">
                <input
                    type="radio"
                    value="name"
                    v-model="filters.search_type"
                >
                <span>По инициалам ФИО</span>
              </label>
              <label class="checkbox-item">
                <input
                    type="radio"
                    value="inn"
                    v-model="filters.search_type"
                >
                <span>По ИНН</span>
              </label>
            </div>
          </div>
        </div>

        <div class="filters-actions">
          <button @click="applyFilters" class="apply-button" :disabled="loading">
            {{ loading ? 'Загрузка...' : 'Применить фильтры' }}
          </button>
          <button @click="resetFilters" class="reset-button">
            Сбросить
          </button>
        </div>
      </div>
    </div>

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
      <button @click="fetchCases" class="retry-button">Повторить попытку</button>
    </div>

    <div v-else-if="!cases.length && !loading" class="empty-list">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path
            d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"
        />
      </svg>
      Нет найденных дел о банкротстве!
    </div>

    <div v-else class="cases-list">
      <div
          v-for="bankruptcyCase in cases"
          :key="bankruptcyCase.id"
          class="case-item"
      >
        <div class="case-header" @click="toggleCaseDetails(bankruptcyCase.id)">
          <div class="case-main-info">
            <div class="person-name">
              {{ getFullName(bankruptcyCase) }}
            </div>
            <div class="case-category" v-if="bankruptcyCase.category_name">
              {{ bankruptcyCase.category_name }}
            </div>
            <div class="person-location" v-if="bankruptcyCase.born_place">
              Место рождения: {{ bankruptcyCase.born_place }}
            </div>
          </div>

          <div class="case-meta">
            <div class="birth-date" v-if="bankruptcyCase.birth_date">
              {{ formatDate(bankruptcyCase.birth_date) }}
            </div>
            <div class="region" v-if="bankruptcyCase.region_name">
              {{ bankruptcyCase.region_name }}
            </div>
          </div>

          <div class="case-expand">
            <svg
                :class="{ rotated: expandedCases.includes(bankruptcyCase.id) }"
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
            v-if="expandedCases.includes(bankruptcyCase.id)"
            class="case-details"
        >
          <div v-if="loadingDetails[bankruptcyCase.id]" class="details-loading">
            <div class="small-spinner"></div>
            <span>Загрузка деталей...</span>
          </div>

          <div v-else-if="detailsErrors[bankruptcyCase.id]" class="details-error">
            <div class="error-icon">⚠️</div>
            <div class="error-message">{{ detailsErrors[bankruptcyCase.id] }}</div>
            <button @click="retryFetchDetails(bankruptcyCase.id)" class="retry-details-button">
              Повторить попытку
            </button>
          </div>

          <div v-else-if="caseDetails[bankruptcyCase.id]" class="details-content">
            <div class="details-grid">
              <div class="detail-section">
                <h4 class="section-title">Персональная информация</h4>

                <div class="detail-item">
                  <span class="detail-label">Полное имя:</span>
                  <span class="detail-value">{{ getFullName(caseDetails[bankruptcyCase.id]) }}</span>
                </div>

                <div class="detail-item" v-if="caseDetails[bankruptcyCase.id].old_name">
                  <span class="detail-label">Прежнее имя:</span>
                  <span class="detail-value">{{ caseDetails[bankruptcyCase.id].old_name }}</span>
                </div>

                <div class="detail-item">
                  <span class="detail-label">Дата рождения:</span>
                  <span class="detail-value">{{
                      formatDate(caseDetails[bankruptcyCase.id].birth_date) || 'Не указана'
                    }}</span>
                </div>

                <div class="detail-item">
                  <span class="detail-label">Место рождения:</span>
                  <span class="detail-value">{{ caseDetails[bankruptcyCase.id].born_place || 'Не указано' }}</span>
                </div>
              </div>

              <div class="detail-section">
                <h4 class="section-title">Документы и реквизиты</h4>

                <div class="detail-item">
                  <span class="detail-label">ИНН:</span>
                  <span class="detail-value">{{ caseDetails[bankruptcyCase.id].inn || 'Не указан' }}</span>
                </div>

                <div class="detail-item">
                  <span class="detail-label">ОГРН:</span>
                  <span class="detail-value">{{ caseDetails[bankruptcyCase.id].ogrn || 'Не указан' }}</span>
                </div>

                <div class="detail-item">
                  <span class="detail-label">СНИЛС:</span>
                  <span class="detail-value">{{ caseDetails[bankruptcyCase.id].snils || 'Не указан' }}</span>
                </div>
              </div>

              <div class="detail-section">
                <h4 class="section-title">Местоположение и категория</h4>

                <div class="detail-item">
                  <span class="detail-label">Регион:</span>
                  <span class="detail-value">{{ caseDetails[bankruptcyCase.id].region_name || 'Не указан' }}</span>
                </div>

                <div class="detail-item">
                  <span class="detail-label">Местоположение:</span>
                  <span class="detail-value">{{ caseDetails[bankruptcyCase.id].location || 'Не указано' }}</span>
                </div>

                <div class="detail-item">
                  <span class="detail-label">Категория:</span>
                  <span class="detail-value">{{ caseDetails[bankruptcyCase.id].category_name || 'Не указана' }}</span>
                </div>
              </div>

              <div class="detail-section full-width" v-if="caseDetails[bankruptcyCase.id].information">
                <h4 class="section-title">Дополнительная информация</h4>
                <div class="information-content">
                  {{ caseDetails[bankruptcyCase.id].information }}
                </div>
              </div>

              <div class="detail-section full-width" v-if="caseDetails[bankruptcyCase.id].link">
                <h4 class="section-title">Ссылка на источник</h4>
                <div class="link-container">
                  <a
                      :href="caseDetails[bankruptcyCase.id].link"
                      target="_blank"
                      class="source-link"
                  >
                    Открыть в источнике ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="cases.length > 0" class="pagination-section">
      <div class="pagination-info">
        Страница {{ currentPage }} из {{ totalPages }}
        (всего: {{ filteredTotalCount }})
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
            :disabled="currentPage >= totalPages || loading"
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
            :max="totalPages"
            step="1"
            :disabled="loading"
            class="page-jump-input"
        >
        <button
            @click="jumpToPage"
            :disabled="loading || !pageJumpInput || !Number.isInteger(pageJumpInput) || pageJumpInput < 1 || pageJumpInput > totalPages"
            class="page-jump-button"
        >
          Перейти
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue';

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
const cases = ref([]);
const currentPage = ref(1);
const pageSize = ref(20);
const totalPages = ref(0);
const filteredTotalCount = ref(0);
const pageJumpInput = ref(null);

const filters = reactive({
  search_type: null
});

const expandedCases = ref([]);
const caseDetails = ref({});
const loadingDetails = ref({});
const detailsErrors = ref({});

const formatDate = (dateString) => {
  if (!dateString) return 'Дата не указана';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Дата не указана';
    }
    return date.toLocaleDateString('ru-RU');
  } catch {
    return 'Дата не указана';
  }
};

const getFullName = (person) => {
  if (!person) return '';
  const parts = [person.last_name, person.first_name, person.second_name].filter(Boolean);
  return parts.join(' ') || 'Имя не указано';
};

const fetchCases = async () => {
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
      size: pageSize.value,
      search_type: filters.search_type
    };

    const response = await fetch('/api/irbis/bankruptcy/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    cases.value = data.cases || [];
    totalPages.value = data.total_pages || 0;
    filteredTotalCount.value = data.total_count || 0;
  } catch (err) {
    error.value = err.message || 'Произошла ошибка при загрузке данных';
    console.error('Error fetching bankruptcy cases:', err);
  } finally {
    loading.value = false;
  }
};

const fetchCaseDetails = async (caseId) => {
  if (caseDetails.value[caseId]) return;

  loadingDetails.value[caseId] = true;
  detailsErrors.value[caseId] = null;

  try {
    const response = await fetch(`/api/irbis/bankruptcy/case_full/${caseId}`);

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

const onFiltersChange = () => {
  // applyFilters()
};

const applyFilters = () => {
  currentPage.value = 1;
  fetchCases();
};

const resetFilters = () => {
  filters.search_type = null;
  currentPage.value = 1;
  fetchCases();
};

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  fetchCases();
};

const jumpToPage = () => {
  if (pageJumpInput.value &&
      Number.isInteger(pageJumpInput.value) &&
      pageJumpInput.value >= 1 &&
      pageJumpInput.value <= totalPages.value) {
    changePage(pageJumpInput.value);
    pageJumpInput.value = null;
  }
};

watch(() => props.isActive, (isActive) => {
  if (isActive && cases.value.length === 0 && props.queryId) {
    fetchCases();
  }
});

onMounted(() => {
  if (props.isActive && props.queryId) {
    fetchCases();
  }
});
</script>

<style scoped>
.bankruptcy-tab {
  padding: 15px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Filters Section */
.filters-section {
  margin-bottom: 20px;
}

.filters-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filters-title {
  margin: 0 0 15px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.filters-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-label {
  font-weight: 600;
  color: #666;
  font-size: 14px;
}

/* Checkbox Styles */
.checkboxes-container {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
}

.checkbox-item input[type="radio"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

/* Filter Actions */
.filters-actions {
  display: flex;
  gap: 10px;
}

.apply-button, .reset-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.apply-button {
  background: #4400ed;
  color: white;
}

.apply-button:hover:not(:disabled) {
  background: #3300cc;
}

.apply-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.reset-button {
  background: #f8f9fa;
  color: #333;
  border: 1px solid #ddd;
}

.reset-button:hover {
  background: #e9ecef;
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

/* Cases List */
.cases-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.case-item {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.case-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #eee;
}

.case-header:hover {
  background-color: #f8f9fa;
}

.case-main-info {
  flex: 1;
}

.person-name {
  font-weight: 600;
  font-size: 16px;
  color: #333;
  margin-bottom: 4px;
}

.case-category {
  font-size: 14px;
  color: #4400ed;
  font-weight: 500;
  margin-bottom: 4px;
}

.person-location {
  font-size: 12px;
  color: #666;
}

.case-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  margin-right: 20px;
}

.birth-date {
  font-size: 12px;
  color: #666;
}

.region {
  font-size: 12px;
  background: #28a745;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
}

.search-type-badge {
  font-size: 11px;
  background: #6c757d;
  color: white;
  padding: 1px 4px;
  border-radius: 2px;
}

.case-expand svg {
  width: 16px;
  height: 16px;
  fill: #666;
  transition: transform 0.2s;
}

.case-expand svg.rotated {
  transform: rotate(180deg);
}

/* Case Details */
.case-details {
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
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
}

.detail-section {
  background: white;
  padding: 15px;
  border-radius: 6px;
  border-left: 4px solid #4400ed;
}

.detail-section.full-width {
  grid-column: 1 / -1;
}

.section-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #4400ed;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
}

.detail-item:last-child {
  margin-bottom: 0;
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
  word-break: break-word;
}

.information-content {
  background: white;
  padding: 12px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  border: 1px solid #e9ecef;
}

.link-container {
  background: white;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.source-link {
  color: #4400ed;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
}

.source-link:hover {
  text-decoration: underline;
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

@media (max-width: 768px) {
  .checkboxes-container {
    flex-direction: column;
    gap: 8px;
  }

  .case-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .case-meta {
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
</style>