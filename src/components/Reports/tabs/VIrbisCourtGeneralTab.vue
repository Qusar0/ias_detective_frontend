<template>
  <div class="court-general-tab">
    <div class="filters-section">
      <div class="filters-card">
        <h3 class="filters-title">Фильтры поиска</h3>

        <div class="filters-grid">
          <div class="filter-group">
            <label class="filter-label">Регионы:</label>
            <div class="switch-container">
              <label class="switch">
                <input type="checkbox" v-model="filters.all_regions" @change="onFiltersChange">
                <span class="slider"></span>
              </label>
              <span class="switch-label">
                {{ filters.all_regions ? 'Все регионы' : 'Выбранные регионы' }}
              </span>
            </div>
          </div>

          <div class="filter-group">
            <label class="filter-label">Категории дел:</label>
            <div class="checkboxes-container">
              <label class="checkbox-item">
                <input
                    type="checkbox"
                    :checked="filters.case_categories.length === 0"
                    @change="toggleAllCategories"
                >
                <span>Все категории</span>
              </label>
              <label
                  v-for="category in categoryOptions"
                  :key="category.code"
                  class="checkbox-item"
              >
                <input
                    type="checkbox"
                    :value="category.code"
                    v-model="filters.case_categories"
                    @change="onFiltersChange"
                >
                <span>{{ category.name }}</span>
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
      Нет найденных дел!
    </div>

    <div v-else class="cases-list">
      <div
          v-for="courtCase in cases"
          :key="courtCase.case_id"
          class="case-item"
      >
        <div class="case-header" @click="toggleCaseDetails(courtCase.case_id)">
          <div class="case-main-info">
            <div class="case-number">
              Дело № {{ courtCase.case_number }}
            </div>
            <div class="case-court">
              {{ courtCase.court_name }}
            </div>
          </div>

          <div class="case-meta">
            <div class="case-dates">
              {{ formatPeriod(courtCase.start_date, courtCase.end_date) }}
            </div>
            <div class="case-region">{{ courtCase.region?.name }}</div>
            <div v-if="courtCase.review > 0" class="case-review">
              Апелляций: {{ courtCase.review }}
            </div>
          </div>

          <div class="case-expand">
            <svg
                :class="{ rotated: expandedCases.includes(courtCase.case_id) }"
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
            v-if="expandedCases.includes(courtCase.case_id)"
            class="case-details"
        >
          <div v-if="loadingDetails[courtCase.case_id]" class="details-loading">
            <div class="small-spinner"></div>
            <span>Загрузка деталей...</span>
          </div>

          <div v-else-if="detailsErrors[courtCase.case_id]" class="details-error">
            <div class="error-icon">⚠️</div>
            <div class="error-message">{{ detailsErrors[courtCase.case_id] }}</div>
            <button @click="retryFetchDetails(courtCase.case_id)" class="retry-details-button">
              Повторить попытку
            </button>
          </div>

          <div v-else-if="caseDetails[courtCase.case_id]" class="details-content">
            <div class="details-grid">
              <div class="detail-item">
                <span class="detail-label">Судья:</span>
                <span class="detail-value">{{ caseDetails[courtCase.case_id].judge || 'Не указан' }}</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Тип процесса:</span>
                <span class="detail-value">{{ caseDetails[courtCase.case_id].process_type?.name || 'Не указан' }}</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Категория:</span>
                <span class="detail-value">{{ caseDetails[courtCase.case_id].papers_pretty || 'Не указана' }}</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Тип совпадения:</span>
                <span class="detail-value">{{ translateMatchType(caseDetails[courtCase.case_id].match_type?.name) || 'Не указан' }}</span>
              </div>

              <div v-if="caseDetails[courtCase.case_id].articles?.length" class="detail-item full-width">
                <span class="detail-label">Статьи:</span>
                <div class="articles-list">
                  <span
                      v-for="article in caseDetails[courtCase.case_id].articles"
                      :key="article"
                      class="article-tag"
                  >
                    {{ article }}
                  </span>
                </div>
              </div>

              <div v-if="caseDetails[courtCase.case_id].faces?.length" class="detail-item full-width">
                <span class="detail-label">Участники:</span>
                <div class="faces-list">
                  <div
                      v-for="face in caseDetails[courtCase.case_id].faces"
                      :key="face.face"
                      class="face-item"
                  >
                    <span class="face-role">{{ face.role_name || 'Участник' }}:</span>
                    <span class="face-name">{{ face.face }}</span>
                  </div>
                </div>
              </div>

              <div v-if="caseDetails[courtCase.case_id].progress?.length" class="detail-item full-width">
                <span class="detail-label">Ход дела:</span>
                <div class="progress-list">
                  <div
                      v-for="(progressItem, index) in caseDetails[courtCase.case_id].progress"
                      :key="index"
                      class="progress-item"
                  >
                    <div class="progress-name">{{ progressItem.name }}</div>
                    <div class="progress-data">{{ progressItem.progress_data }}</div>
                    <div v-if="progressItem.resolution" class="progress-resolution">
                      Решение: {{ progressItem.resolution }}
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="Object.keys(caseDetails[courtCase.case_id].links || {}).length" class="detail-item full-width">
                <span class="detail-label">Ссылки:</span>
                <div class="links-list">
                  <div
                      v-for="(links, category) in caseDetails[courtCase.case_id].links"
                      :key="category"
                      class="links-category"
                  >
                    <div
                        v-if="links.length > 0"
                        class="links-category-name"
                    >
                      {{ translateLinkCategory(category) }}:
                    </div>
                    <div
                        v-if="links.length > 0"
                        class="links-items"
                    >
                      <a
                          v-for="link in links"
                          :key="link"
                          :href="link"
                          target="_blank"
                          class="link-item"
                      >
                        {{ link }}
                      </a>
                    </div>
                  </div>
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

const categoryOptions = [
  {code: 'A', name: 'Административные'},
  {code: 'G', name: 'Гражданские'},
  {code: 'U', name: 'Уголовные'},
  {code: 'M', name: 'Материалы'},
  {code: 'O', name: 'Особые производства'}
];

const loading = ref(false);
const error = ref(null);
const cases = ref([]);
const currentPage = ref(1);
const pageSize = ref(20);
const totalPages = ref(0);
const filteredTotalCount = ref(0);
const pageJumpInput = ref(null);

const filters = reactive({
  all_regions: true,
  case_categories: []
});

const expandedCases = ref([]);
const caseDetails = ref({});
const loadingDetails = ref({});
const detailsErrors = ref({});

const formatDate = (dateString) => {
  if (!dateString || dateString === '') return null;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date.toLocaleDateString('ru-RU');
  } catch {
    return null;
  }
};

const formatPeriod = (startDate, endDate) => {
  const formattedStart = formatDate(startDate);
  const formattedEnd = formatDate(endDate);

  if (!formattedStart && !formattedEnd) {
    return 'Дата не указана';
  }

  if (formattedStart && formattedEnd) {
    return `${formattedStart} - ${formattedEnd}`;
  }

  return formattedStart || formattedEnd;
};

const translateLinkCategory = (category) => {
  const translations = {
    'card': 'Ссылка на сайт суда с делом',
    'root': 'Ссылка на сайт суда',
    'resolution text': 'Текст решения суда'
  };
  return translations[category] || category;
};

const translateMatchType = (matchType) => {
  if (!matchType) return null;
  const translations = {
    'partly': 'Частичное совпадение',
    'full': 'Полное совпадение',
    'inn': 'Совпадение по ИНН',
    'name': 'Совпадение по ФИО'
  };
  const lowerMatch = matchType.toLowerCase();
  return translations[lowerMatch] || matchType;
};

const fetchCases = async () => {
  if (!props.queryId) {
    error.value = 'Query ID не предоставлен';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const response = await fetch('/api/irbis/court_general/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query_id: props.queryId,
        page: currentPage.value,
        size: pageSize.value,
        all_regions: filters.all_regions,
        case_categories: filters.case_categories.length > 0 ? filters.case_categories : null
      })
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
    console.error('Error fetching cases:', err);
  } finally {
    loading.value = false;
  }
};

const fetchCaseDetails = async (caseId) => {
  if (caseDetails.value[caseId]) return;

  loadingDetails.value[caseId] = true;
  detailsErrors.value[caseId] = null;

  try {
    const response = await fetch(`/api/irbis/court_general/case_full/${caseId}`);

    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status}`);
    }

    caseDetails.value[caseId] = await response.json();
  } catch (err) {
    console.error('Error fetching case details:', err);
    detailsErrors.value[caseId] = err.message || 'Произошла ошибка при загрузке деталей дела';
  } finally {
    loadingDetails.value[caseId] = false;
  }
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

const retryFetchDetails = (caseId) => {
  delete caseDetails.value[caseId];
  delete detailsErrors.value[caseId];
  fetchCaseDetails(caseId);
};

const onFiltersChange = () => {
  // applyFilters()
};

const applyFilters = () => {
  currentPage.value = 1;
  fetchCases();
};

const resetFilters = () => {
  filters.all_regions = true;
  filters.case_categories = [];
  currentPage.value = 1;
  fetchCases();
};

const toggleAllCategories = (event) => {
  if (event.target.checked) {
    filters.case_categories = [];
  } else {
    filters.case_categories = [...categoryOptions.map(c => c.code)];
  }
  onFiltersChange();
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
.court-general-tab {
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
  grid-template-columns: 1fr 2fr;
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

/* Switch Styles */
.switch-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #4400ed;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.switch-label {
  font-size: 14px;
  color: #333;
}

/* Checkbox Styles */
.checkboxes-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
}

.checkbox-item input[type="checkbox"] {
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

.case-number {
  font-weight: 600;
  font-size: 16px;
  color: #333;
  margin-bottom: 4px;
}

.case-court {
  font-size: 14px;
  color: #666;
}

.case-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  margin-right: 20px;
}

.case-dates {
  font-size: 12px;
  color: #666;
}

.case-dates .no-date {
  color: #999;
  font-style: italic;
}

.case-region {
  font-size: 12px;
  color: #888;
}

.case-review {
  font-size: 12px;
  background: #4400ed;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
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

.articles-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.article-tag {
  background: #e9ecef;
  color: #495057;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
}

.faces-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.face-item {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

.face-role {
  font-weight: 400;
  color: #666;
  min-width: 100px;
  font-size: 14px;
}

.face-name {
  color: #333;
  font-size: 14px;
}

.progress-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-item {
  background: white;
  padding: 12px;
  border-radius: 4px;
  border-left: 3px solid #4400ed;
}

.progress-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.progress-data {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.progress-resolution {
  font-size: 12px;
  color: #4400ed;
  font-style: italic;
}

.links-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.links-category-name {
  font-weight: 400;
  color: #666;
  margin-bottom: 4px;
  font-size: 13px;
}

.links-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.link-item {
  color: #4400ed;
  text-decoration: none;
  font-size: 12px;
  font-weight: 400;
}

.link-item:hover {
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
  .filters-grid {
    grid-template-columns: 1fr;
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
</style>