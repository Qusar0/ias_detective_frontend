<template>
  <div class="corruption-tab">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <div class="loading-text">Загрузка данных...</div>
    </div>

    <div v-else-if="error" class="error-container">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z" />
      </svg>
      <div class="error-text">{{ error }}</div>
      <button @click="fetchCorruptionCases" class="retry-button">Повторить попытку</button>
    </div>

    <div v-else-if="!corruptionCases.length && !loading" class="empty-list">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z" />
      </svg>
      Нет найденных коррупционных дел!
    </div>

    <div v-else class="corruption-list">
      <div
        v-for="corruptionCase in corruptionCases"
        :key="corruptionCase.id"
        class="corruption-item"
      >
        <div class="corruption-header" @click="toggleCorruptionDetails(corruptionCase.id)">
          <div class="corruption-main-info">
            <div class="person-name">
              {{ corruptionCase.full_name }}
            </div>
            <div class="organization" v-if="corruptionCase.organization">
              {{ corruptionCase.organization }}
            </div>
            <div class="position" v-if="corruptionCase.position">
              Должность: {{ corruptionCase.position }}
            </div>
          </div>

          <div class="corruption-meta">
            <div class="application-date">
              <span class="date-label">Дата подачи:</span>
              <span class="date-value">{{ formatDate(corruptionCase.application_date) }}</span>
            </div>
            <div class="case-id">
              ID: {{ corruptionCase.id }}
            </div>
            <div class="corruption-badge">
              ⚠️ Коррупция
            </div>
          </div>

          <div class="corruption-expand">
            <svg
              :class="{ rotated: expandedCases.includes(corruptionCase.id) }"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
            >
              <path d="M201.4 342.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 274.7 86.6 137.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/>
            </svg>
          </div>
        </div>

        <div
          v-if="expandedCases.includes(corruptionCase.id)"
          class="corruption-details"
        >
          <div v-if="loadingDetails[corruptionCase.id]" class="details-loading">
            <div class="small-spinner"></div>
            <span>Загрузка деталей...</span>
          </div>

          <div v-else-if="detailsErrors[corruptionCase.id]" class="details-error">
            <div class="error-icon">⚠️</div>
            <div class="error-message">{{ detailsErrors[corruptionCase.id] }}</div>
            <button @click="retryFetchDetails(corruptionCase.id)" class="retry-details-button">
              Повторить попытку
            </button>
          </div>

          <div v-else-if="caseDetails[corruptionCase.id]" class="details-content">
            <div class="details-grid">
              <div class="detail-section">
                <h4 class="section-title">Персональная информация</h4>

                <div class="detail-item">
                  <span class="detail-label">ФИО:</span>
                  <span class="detail-value">{{ caseDetails[corruptionCase.id].full_name }}</span>
                </div>

                <div class="detail-item">
                  <span class="detail-label">Организация:</span>
                  <span class="detail-value">{{ caseDetails[corruptionCase.id].organization || 'Не указана' }}</span>
                </div>

                <div class="detail-item">
                  <span class="detail-label">Должность:</span>
                  <span class="detail-value">{{ caseDetails[corruptionCase.id].position || 'Не указана' }}</span>
                </div>
              </div>

              <div class="detail-section">
                <h4 class="section-title">Правовая информация</h4>

                <div class="detail-item">
                  <span class="detail-label">Нормативный акт:</span>
                  <span class="detail-value">{{ caseDetails[corruptionCase.id].normative_act || 'Не указан' }}</span>
                </div>

                <div class="detail-item">
                  <span class="detail-label">Дата подачи:</span>
                  <span class="detail-value">{{ formatDate(caseDetails[corruptionCase.id].application_date) || 'Не указана' }}</span>
                </div>

                <div class="detail-item">
                  <span class="detail-label">Дата публикации:</span>
                  <span class="detail-value">{{ formatDate(caseDetails[corruptionCase.id].publish_date) || 'Не указана' }}</span>
                </div>
              </div>

              <div class="detail-section" v-if="caseDetails[corruptionCase.id].excluded_reason">
                <h4 class="section-title">Информация об исключении</h4>

                <div class="detail-item full-width">
                  <span class="detail-label">Причина исключения:</span>
                  <div class="exclusion-reason">
                    {{ caseDetails[corruptionCase.id].excluded_reason }}
                  </div>
                </div>

                <div class="exclusion-status">
                  <span class="status-badge excluded">
                    ✅ Исключен из реестра
                  </span>
                </div>
              </div>

              <div class="detail-section" v-else>
                <h4 class="section-title">Статус</h4>

                <div class="active-status">
                  <span class="status-badge active">
                    🔴 Активно в реестре
                  </span>
                  <div class="status-description">
                    Лицо находится в реестре коррупционеров
                  </div>
                </div>
              </div>

              <div class="detail-section full-width">
                <h4 class="section-title">Временная линия</h4>

                <div class="timeline">
                  <div class="timeline-item" v-if="caseDetails[corruptionCase.id].application_date">
                    <div class="timeline-date">{{ formatDate(caseDetails[corruptionCase.id].application_date) }}</div>
                    <div class="timeline-event">Подача заявления</div>
                  </div>

                  <div class="timeline-item" v-if="caseDetails[corruptionCase.id].publish_date">
                    <div class="timeline-date">{{ formatDate(caseDetails[corruptionCase.id].publish_date) }}</div>
                    <div class="timeline-event">Публикация в реестре</div>
                  </div>

                  <div class="timeline-item" v-if="caseDetails[corruptionCase.id].excluded_reason">
                    <div class="timeline-date">{{ getCurrentDate() }}</div>
                    <div class="timeline-event excluded">Исключение из реестра</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="corruptionCases.length > 0" class="pagination-section">
      <div class="pagination-info">
        Страница {{ currentPage }} из {{ Math.ceil(totalItems / pageSize) }}
        (всего: {{ totalItems }})
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
          :disabled="currentPage >= Math.ceil(totalItems / pageSize) || loading"
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
  }
})

const emit = defineEmits(['update-count'])

const loading = ref(false)
const error = ref(null)
const corruptionCases = ref([])
const totalItems = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const cumulativeCount = ref(0)

const expandedCases = ref([])
const caseDetails = ref({})
const loadingDetails = ref({})
const detailsErrors = ref({})

const formatDate = (dateString) => {
  if (!dateString) return 'Неизвестно'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'Неизвестно'
    }
    return date.toLocaleDateString('ru-RU')
  } catch {
    return 'Неизвестно'
  }
}

const getCurrentDate = () => {
  return new Date().toLocaleDateString('ru-RU')
}

const fetchCorruptionCases = async () => {
  if (!props.queryId) {
    error.value = 'Query ID не предоставлен'
    return
  }

  loading.value = true
  error.value = null

  try {
    const requestBody = {
      query_id: props.queryId,
      page: currentPage.value,
      size: pageSize.value
    }

    const response = await fetch('/api/irbis/corruption/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    corruptionCases.value = data
    totalItems.value = data.length === pageSize.value ? currentPage.value * pageSize.value + 1 : (currentPage.value - 1) * pageSize.value + data.length

    if (currentPage.value === 1) {
      cumulativeCount.value = data.length
    } else {
      cumulativeCount.value = (currentPage.value - 1) * pageSize.value + data.length
    }

    emit('update-count', cumulativeCount.value)
  } catch (err) {
    error.value = err.message || 'Произошла ошибка при загрузке данных'
    console.error('Error fetching corruption cases:', err)
  } finally {
    loading.value = false
  }
}

const fetchCaseDetails = async (caseId) => {
  if (caseDetails.value[caseId]) return

  loadingDetails.value[caseId] = true
  detailsErrors.value[caseId] = null

  try {
    const response = await fetch(`/api/irbis/corruption/case_full/${caseId}`)

    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status}`)
    }

    caseDetails.value[caseId] = await response.json()
  } catch (err) {
    console.error('Error fetching case details:', err)
    detailsErrors.value[caseId] = err.message || 'Произошла ошибка при загрузке деталей'
  } finally {
    loadingDetails.value[caseId] = false
  }
}

const retryFetchDetails = (caseId) => {
  delete caseDetails.value[caseId]
  delete detailsErrors.value[caseId]
  fetchCaseDetails(caseId)
}

const toggleCorruptionDetails = (caseId) => {
  const index = expandedCases.value.indexOf(caseId)
  if (index > -1) {
    expandedCases.value.splice(index, 1)
  } else {
    expandedCases.value.push(caseId)
    fetchCaseDetails(caseId)
  }
}

const changePage = (page) => {
  if (page < 1) return
  currentPage.value = page
  fetchCorruptionCases()
}

watch(() => props.isActive, (isActive) => {
  if (isActive && corruptionCases.value.length === 0 && props.queryId) {
    fetchCorruptionCases()
  }
})

onMounted(() => {
  if (props.isActive && props.queryId) {
    fetchCorruptionCases()
  }
})
</script>

<style scoped>
.corruption-tab {
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
  border-top: 4px solid #dc3545;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-text {
  color: #666;
  font-size: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
  background: #dc3545;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.retry-button:hover {
  background: #c82333;
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

/* Corruption Cases List */
.corruption-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.corruption-item {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border-left: 4px solid #dc3545;
}

.corruption-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #eee;
}

.corruption-header:hover {
  background-color: #f8f9fa;
}

.corruption-main-info {
  flex: 1;
}

.person-name {
  font-weight: 600;
  font-size: 16px;
  color: #333;
  margin-bottom: 4px;
}

.organization {
  font-size: 14px;
  color: #dc3545;
  font-weight: 500;
  margin-bottom: 4px;
}

.position {
  font-size: 14px;
  color: #666;
}

.corruption-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  margin-right: 20px;
  min-width: 200px;
}

.application-date {
  text-align: right;
}

.date-label {
  font-size: 12px;
  color: #666;
  display: block;
}

.date-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.case-id {
  font-size: 12px;
  color: #666;
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 3px;
}

.corruption-badge {
  background: #dc3545;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.corruption-expand svg {
  width: 16px;
  height: 16px;
  fill: #666;
  transition: transform 0.2s;
}

.corruption-expand svg.rotated {
  transform: rotate(180deg);
}

/* Corruption Case Details */
.corruption-details {
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
  border-top: 2px solid #dc3545;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.details-content {
  padding: 20px;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.detail-section {
  background: white;
  padding: 15px;
  border-radius: 6px;
  border-left: 4px solid #dc3545;
}

.detail-section.full-width {
  grid-column: 1 / -1;
}

.section-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #dc3545;
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
  word-break: break-word;
}

.exclusion-reason {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #e9ecef;
  font-size: 14px;
  line-height: 1.4;
  color: #333;
  margin-top: 8px;
}

.exclusion-status,
.active-status {
  margin-top: 12px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
}

.status-badge.active {
  background: #dc3545;
  color: white;
}

.status-badge.excluded {
  background: #28a745;
  color: white;
}

.status-description {
  margin-top: 8px;
  font-size: 13px;
  color: #666;
  font-style: italic;
}

/* Timeline */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.timeline-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: 4px;
  border-left: 3px solid #dc3545;
}

.timeline-item .timeline-event.excluded {
  color: #28a745;
}

.timeline-date {
  font-weight: 600;
  color: #333;
  min-width: 100px;
  margin-right: 16px;
  font-size: 14px;
}

.timeline-event {
  color: #666;
  font-size: 14px;
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
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.page-button:hover:not(:disabled) {
  background: #c82333;
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
  .corruption-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .corruption-meta {
    align-items: flex-start;
    margin-right: 0;
    min-width: auto;
    width: 100%;
  }

  .application-date {
    text-align: left;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .timeline-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .timeline-date {
    min-width: auto;
    margin-right: 0;
  }

  .pagination-section {
    flex-direction: column;
    gap: 10px;
  }
}
</style>