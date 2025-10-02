<template>
  <div class="pledges-tab">
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
      <button @click="fetchPledges" class="retry-button">Повторить попытку</button>
    </div>

    <div v-else-if="!pledges.length && !loading" class="empty-list">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path
            d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"
        />
      </svg>
      Нет найденных залогов!
    </div>

    <div v-else class="pledges-list">
      <div
          v-for="pledge in pledges"
          :key="pledge.case_id"
          class="pledge-item"
      >
        <div class="pledge-header" @click="togglePledgeDetails(pledge.case_id)">
          <div class="pledge-main-info">
            <div class="pledge-type">
              {{ pledge.pledge_type }}
            </div>
            <div class="pledge-date">
              Дата регистрации: {{ formatDate(pledge.reg_date) }}
            </div>
            <div class="parties-summary">
              <span class="party-count pledgers">
                Залогодатели: {{ pledge.pledgers?.length || 0 }}
              </span>
              <span class="party-count pledgees">
                Залогодержатели: {{ pledge.pledgees?.length || 0 }}
              </span>
              <span class="party-count pledges">
                Предметы залога: {{ pledge.pledges?.length || 0 }}
              </span>
            </div>
          </div>

          <div class="pledge-meta">
            <div class="quick-parties">
              <div v-if="pledge.pledgers?.length" class="quick-party">
                <span class="party-label">Залогодатель:</span>
                <span class="party-name">{{ pledge.pledgers[0].name }}</span>
                <span v-if="pledge.pledgers.length > 1" class="more-count">
                  +{{ pledge.pledgers.length - 1 }} ещё
                </span>
              </div>
              <div v-if="pledge.pledgees?.length" class="quick-party">
                <span class="party-label">Залогодержатель:</span>
                <span class="party-name">{{ pledge.pledgees[0].name }}</span>
                <span v-if="pledge.pledgees.length > 1" class="more-count">
                  +{{ pledge.pledgees.length - 1 }} ещё
                </span>
              </div>
            </div>
          </div>

          <div class="pledge-expand">
            <svg
                :class="{ rotated: expandedPledges.includes(pledge.case_id) }"
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
            v-if="expandedPledges.includes(pledge.case_id)"
            class="pledge-details"
        >
          <div v-if="loadingDetails[pledge.case_id]" class="details-loading">
            <div class="small-spinner"></div>
            <span>Загрузка деталей...</span>
          </div>

          <div v-else-if="detailsErrors[pledge.case_id]" class="details-error">
            <div class="error-icon">⚠️</div>
            <div class="error-message">{{ detailsErrors[pledge.case_id] }}</div>
            <button @click="retryFetchDetails(pledge.case_id)" class="retry-details-button">
              Повторить попытку
            </button>
          </div>

          <div v-else-if="pledgeDetails[pledge.case_id]" class="details-content">
            <div class="details-grid">
              <div class="detail-section">
                <h4 class="section-title">Общая информация</h4>

                <div class="detail-item">
                  <span class="detail-label">Номер в реестре:</span>
                  <span class="detail-value">{{
                      pledgeDetails[pledge.case_id].pledge_reestr_number || 'Не указан'
                    }}</span>
                </div>

                <div class="detail-item">
                  <span class="detail-label">Тип залога:</span>
                  <span class="detail-value">{{ pledgeDetails[pledge.case_id].pledge_type || 'Не указан' }}</span>
                </div>

                <div class="detail-item">
                  <span class="detail-label">Дата регистрации:</span>
                  <span class="detail-value">{{
                      formatDate(pledgeDetails[pledge.case_id].reg_date) || 'Не указана'
                    }}</span>
                </div>
              </div>

              <div class="detail-section">
                <h4 class="section-title">Залогодатели</h4>

                <div v-if="!pledgeDetails[pledge.case_id].pledgers?.length" class="no-data">
                  Информация о залогодателях отсутствует
                </div>

                <div v-else class="parties-list">
                  <div
                      v-for="(pledger, index) in pledgeDetails[pledge.case_id].pledgers"
                      :key="index"
                      class="party-item pledger"
                  >
                    <div class="party-name">{{ pledger.name }}</div>
                    <div class="party-details">
                      <div v-if="pledger.birth_date" class="party-detail">
                        <span class="detail-label">Дата рождения:</span>
                        <span class="detail-value">{{ formatDate(pledger.birth_date) }}</span>
                      </div>
                      <div v-if="pledger.inn" class="party-detail">
                        <span class="detail-label">ИНН:</span>
                        <span class="detail-value">{{ pledger.inn }}</span>
                      </div>
                      <div v-if="pledger.ogrn" class="party-detail">
                        <span class="detail-label">ОГРН:</span>
                        <span class="detail-value">{{ pledger.ogrn }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="detail-section">
                <h4 class="section-title">Залогодержатели</h4>

                <div v-if="!pledgeDetails[pledge.case_id].pledgees?.length" class="no-data">
                  Информация о залогодержателях отсутствует
                </div>

                <div v-else class="parties-list">
                  <div
                      v-for="(pledgee, index) in pledgeDetails[pledge.case_id].pledgees"
                      :key="index"
                      class="party-item pledgee"
                  >
                    <div class="party-name">{{ pledgee.name }}</div>
                    <div class="party-details">
                      <div v-if="pledgee.birth_date" class="party-detail">
                        <span class="detail-label">Дата рождения:</span>
                        <span class="detail-value">{{ formatDate(pledgee.birth_date) }}</span>
                      </div>
                      <div v-if="pledgee.inn" class="party-detail">
                        <span class="detail-label">ИНН:</span>
                        <span class="detail-value">{{ pledgee.inn }}</span>
                      </div>
                      <div v-if="pledgee.ogrn" class="party-detail">
                        <span class="detail-label">ОГРН:</span>
                        <span class="detail-value">{{ pledgee.ogrn }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="detail-section full-width">
                <h4 class="section-title">Предметы залога</h4>

                <div v-if="!pledgeDetails[pledge.case_id].pledges?.length" class="no-data">
                  Информация о предметах залога отсутствует
                </div>

                <div v-else class="pledges-objects-grid">
                  <div
                      v-for="(pledgeObj, index) in pledgeDetails[pledge.case_id].pledges"
                      :key="index"
                      class="pledge-object"
                  >
                    <div class="object-header">
                      <span class="object-number">{{ pledgeObj.pledge_num || `№${index + 1}` }}</span>
                      <span class="object-type">{{ pledgeObj.pledge_type }}</span>
                    </div>
                    <div v-if="pledgeObj.pledge_num_name" class="object-name">
                      {{ pledgeObj.pledge_num_name }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="pledges.length > 0" class="pagination-section">
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
const pledges = ref([]);
const currentPage = ref(1);
const pageSize = ref(20);
const pageJumpInput = ref(null);

const expandedPledges = ref([]);
const pledgeDetails = ref({});
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

const fetchPledges = async () => {
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

    const response = await fetch('/api/irbis/pledgess/data', {
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
    pledges.value = data;
  } catch (err) {
    error.value = err.message || 'Произошла ошибка при загрузке данных';
    console.error('Error fetching pledges:', err);
  } finally {
    loading.value = false;
  }
};

const fetchPledgeDetails = async (caseId) => {
  if (pledgeDetails.value[caseId]) return;

  loadingDetails.value[caseId] = true;
  detailsErrors.value[caseId] = null;

  try {
    const response = await fetch(`/api/irbis/pledgess/case_full/${caseId}`);

    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status}`);
    }

    pledgeDetails.value[caseId] = await response.json();
  } catch (err) {
    console.error('Error fetching pledge details:', err);
    detailsErrors.value[caseId] = err.message || 'Произошла ошибка при загрузке деталей';
  } finally {
    loadingDetails.value[caseId] = false;
  }
};

const retryFetchDetails = (caseId) => {
  delete pledgeDetails.value[caseId];
  delete detailsErrors.value[caseId];
  fetchPledgeDetails(caseId);
};

const togglePledgeDetails = (caseId) => {
  const index = expandedPledges.value.indexOf(caseId);
  if (index > -1) {
    expandedPledges.value.splice(index, 1);
  } else {
    expandedPledges.value.push(caseId);
    fetchPledgeDetails(caseId);
  }
};

const changePage = (page) => {
  const maxPage = Math.ceil(props.totalCount / pageSize.value);
  if (page < 1 || page > maxPage) return;
  currentPage.value = page;
  fetchPledges();
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
  if (isActive && pledges.value.length === 0 && props.queryId) {
    fetchPledges();
  }
});

onMounted(() => {
  if (props.isActive && props.queryId) {
    fetchPledges();
  }
});
</script>

<style scoped>
.pledges-tab {
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

/* Pledges List */
.pledges-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.pledge-item {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.pledge-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #eee;
}

.pledge-header:hover {
  background-color: #f8f9fa;
}

.pledge-main-info {
  flex: 1;
}

.pledge-type {
  font-weight: 600;
  font-size: 16px;
  color: #333;
  margin-bottom: 4px;
}

.pledge-date {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.parties-summary {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.party-count {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 500;
}

.party-count.pledgers {
  background: #e3f2fd;
  color: #1976d2;
}

.party-count.pledgees {
  background: #f3e5f5;
  color: #7b1fa2;
}

.party-count.pledges {
  background: #e8f5e8;
  color: #388e3c;
}

.pledge-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  margin-right: 20px;
  min-width: 250px;
}

.case-id {
  font-size: 12px;
  color: #666;
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 3px;
}

.quick-parties {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: right;
}

.quick-party {
  font-size: 12px;
}

.party-label {
  color: #666;
  margin-right: 4px;
}

.party-name {
  color: #333;
  font-weight: 500;
}

.more-count {
  color: #4400ed;
  font-size: 11px;
  margin-left: 4px;
}

.pledge-expand svg {
  width: 16px;
  height: 16px;
  fill: #666;
  transition: transform 0.2s;
}

.pledge-expand svg.rotated {
  transform: rotate(180deg);
}

/* Pledge Details */
.pledge-details {
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

.no-data {
  color: #999;
  font-style: italic;
  font-size: 14px;
}

/* Parties */
.parties-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.party-item {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 4px;
  border-left: 3px solid #4400ed;
}

.party-item.pledger {
  border-left-color: #1976d2;
}

.party-item.pledgee {
  border-left-color: #7b1fa2;
}

.party-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.party-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.party-detail {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.party-detail .detail-label {
  color: #666;
}

.party-detail .detail-value {
  color: #333;
  font-weight: 500;
}

/* Pledge Objects */
.pledges-objects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
}

.pledge-object {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 4px;
  border-left: 3px solid #388e3c;
}

.object-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.object-number {
  font-weight: 600;
  color: #333;
  background: #e8f5e8;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
}

.object-type {
  font-size: 12px;
  color: #388e3c;
  font-weight: 500;
}

.object-name {
  font-size: 14px;
  color: #333;
  line-height: 1.3;
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
  .pledge-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .pledge-meta {
    align-items: flex-start;
    margin-right: 0;
    min-width: auto;
    width: 100%;
  }

  .quick-parties {
    text-align: left;
  }

  .parties-summary {
    gap: 8px;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .pledges-objects-grid {
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