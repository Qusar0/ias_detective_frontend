<template>
  <div class="part-in-org-tab">
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
      <button @click="fetchPartInOrg" class="retry-button">Повторить попытку</button>
    </div>

    <div v-else-if="!partInOrgCases.length && !loading" class="empty-list">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path
            d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"
        />
      </svg>
      Нет найденных записей!
    </div>

    <div v-else class="part-in-org-list">
      <div
          v-for="orgCase in partInOrgCases"
          :key="orgCase.case_id"
          class="org-item"
      >
        <div class="org-header" @click="toggleCaseDetails(orgCase.case_id)">
          <div class="org-main-info">
            <div class="org-individual-name">
              {{ orgCase.individual_name }}
            </div>
            <div class="org-name">
              {{ orgCase.org_name }}
            </div>
            <div v-if="orgCase.org_okved" class="org-okved">
              ОКВЭД: {{ orgCase.org_okved }}
            </div>
          </div>

          <div class="org-expand">
            <svg
                :class="{ rotated: expandedCases.includes(orgCase.case_id) }"
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
            v-if="expandedCases.includes(orgCase.case_id)"
            class="org-details"
        >
          <div v-if="loadingDetails[orgCase.case_id]" class="details-loading">
            <div class="loading-spinner"></div>
          </div>

          <div v-else-if="caseDetails[orgCase.case_id]" class="details-content">
            <!-- Информация об организации -->
            <div class="details-section">
              <div class="section-title">Информация об организации:</div>
              <div class="details-grid">
                <div class="detail-item">
                  <span class="detail-label">Наименование:</span>
                  <span class="detail-value">{{ caseDetails[orgCase.case_id].org?.name || 'Не указано' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">ИНН:</span>
                  <span class="detail-value">{{ caseDetails[orgCase.case_id].org?.inn || 'Не указано' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">ОГРН:</span>
                  <span class="detail-value">{{ caseDetails[orgCase.case_id].org?.ogrn || 'Не указано' }}</span>
                </div>
                <div v-if="caseDetails[orgCase.case_id].org?.okved" class="detail-item">
                  <span class="detail-label">ОКВЭД:</span>
                  <span class="detail-value">{{ caseDetails[orgCase.case_id].org.okved }}</span>
                </div>
                <div v-if="caseDetails[orgCase.case_id].org?.address" class="detail-item full-width">
                  <span class="detail-label">Адрес:</span>
                  <span class="detail-value">{{ caseDetails[orgCase.case_id].org.address }}</span>
                </div>
              </div>
            </div>

            <!-- Информация о физическом лице -->
            <div class="details-section">
              <div class="section-title">Информация о физическом лице:</div>
              <div class="details-grid">
                <div class="detail-item">
                  <span class="detail-label">ФИО:</span>
                  <span class="detail-value">{{ caseDetails[orgCase.case_id].individual?.name || 'Не указано' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">ИНН:</span>
                  <span class="detail-value">{{ caseDetails[orgCase.case_id].individual?.inn || 'Не указано' }}</span>
                </div>
              </div>

              <!-- Роли -->
              <div v-if="caseDetails[orgCase.case_id].individual?.roles && caseDetails[orgCase.case_id].individual.roles.length > 0" class="roles-section">
                <div class="roles-title">Роли в организации:</div>
                <div class="roles-list">
                  <div
                      v-for="(role, roleIndex) in caseDetails[orgCase.case_id].individual.roles"
                      :key="roleIndex"
                      class="role-item"
                  >
                    <span class="role-name">{{ role.name }}</span>
                    <span :class="['role-status', { active: role.active, inactive: !role.active }]">
                      {{ role.active ? 'Активна' : 'Неактивна' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="partInOrgCases.length > 0" class="pagination-section">
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
const partInOrgCases = ref([]);
const currentPage = ref(1);
const pageSize = ref(20);
const pageJumpInput = ref(null);
const expandedCases = ref([]);
const caseDetails = reactive({});
const loadingDetails = reactive({});

const fetchPartInOrg = async () => {
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

    const response = await fetch('/api/irbis/part_in_org/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    partInOrgCases.value = await response.json();
  } catch (err) {
    error.value = err.message || 'Произошла ошибка при загрузке данных';
    console.error('Error fetching part in org:', err);
  } finally {
    loading.value = false;
  }
};

const fetchCaseDetails = async (caseId) => {
  if (caseDetails[caseId]) return;

  loadingDetails[caseId] = true;

  try {
    const response = await fetch(`/api/irbis/part_in_org/case_full/${caseId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    caseDetails[caseId] = await response.json();
  } catch (err) {
    console.error('Error fetching case details:', err);
    error.value = 'Ошибка загрузки деталей дела';
  } finally {
    loadingDetails[caseId] = false;
  }
};

const toggleCaseDetails = (caseId) => {
  const expandedIndex = expandedCases.value.indexOf(caseId);
  if (expandedIndex > -1) {
    expandedCases.value.splice(expandedIndex, 1);
  } else {
    expandedCases.value.push(caseId);
    fetchCaseDetails(caseId);
  }
};

const changePage = (page) => {
  const maxPage = Math.ceil(props.totalCount / pageSize.value);
  if (page < 1 || page > maxPage) return;
  currentPage.value = page;
  expandedCases.value = [];
  fetchPartInOrg();
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
  if (isActive && partInOrgCases.value.length === 0 && props.queryId) {
    fetchPartInOrg();
  }
});

onMounted(() => {
  if (props.isActive && props.queryId) {
    fetchPartInOrg();
  }
});
</script>

<style scoped>
.part-in-org-tab {
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

/* Part in Org List */
.part-in-org-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.org-item {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border-left: 4px solid #4400ed;
}

.org-header {
  display: flex;
  align-items: center;
  padding: 20px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.org-header:hover {
  background-color: #f8f9fa;
}

.org-main-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-right: 20px;
}

.org-individual-name {
  font-weight: 600;
  font-size: 16px;
  color: #333;
}

.org-name {
  font-size: 14px;
  color: #4400ed;
  font-weight: 500;
}

.org-okved {
  font-size: 13px;
  color: #666;
}

.org-expand {
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.org-expand:hover {
  background-color: #e9ecef;
}

.org-expand svg {
  width: 16px;
  height: 16px;
  fill: #666;
  transition: transform 0.2s;
}

.org-expand svg.rotated {
  transform: rotate(180deg);
}

/* Details Section */
.org-details {
  border-top: 1px solid #eee;
  background: #f8f9fa;
  padding: 20px;
}

.details-loading {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.details-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.details-section {
  background: white;
  padding: 15px;
  border-radius: 6px;
  border-left: 3px solid #4400ed;
}

.section-title {
  font-weight: 600;
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  text-transform: uppercase;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-label {
  font-size: 12px;
  font-weight: 400;
  color: #666;
}

.detail-value {
  font-size: 14px;
  color: #333;
}

/* Roles Section */
.roles-section {
  margin-top: 15px;
}

.roles-title {
  font-size: 13px;
  font-weight: 600;
  color: #666;
  margin-bottom: 10px;
}

.roles-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.role-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #f8f9fa;
  border-radius: 4px;
}

.role-name {
  font-size: 14px;
  color: #333;
}

.role-status {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
}

.role-status.active {
  background: #d4edda;
  color: #155724;
}

.role-status.inactive {
  background: #f8d7da;
  color: #721c24;
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
@media (max-width: 768px) {
  .org-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .org-expand {
    align-self: flex-end;
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
