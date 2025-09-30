<template>
  <div class="general-tab">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <div class="loading-text">Загрузка данных...</div>
    </div>

    <div v-else-if="error" class="error-container">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z" />
      </svg>
      <div class="error-text">
        Ошибка загрузки данных: {{ error }}
      </div>
      <button @click="fetchGeneralInfo" class="retry-button">
        Повторить попытку
      </button>
    </div>

    <div v-else-if="!localGeneralInfo" class="empty-list">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z" />
      </svg>
      Нет данных для отображения!
    </div>

    <div v-else class="general-info-container">
      <div class="general-info-card">
        <h3 class="info-title">Общая информация</h3>

        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">ФИО:</span>
            <span class="info-value">{{ localGeneralInfo.fullname || 'Не указано' }}</span>
          </div>

          <div class="info-item">
            <span class="info-label">Дата рождения:</span>
            <span class="info-value">{{ localGeneralInfo.birth_date || 'Не указано' }}</span>
          </div>

          <div class="info-item">
            <span class="info-label">Серия паспорта:</span>
            <span class="info-value">{{ localGeneralInfo.passport_series || 'Не указано' }}</span>
          </div>

          <div class="info-item">
            <span class="info-label">Номер паспорта:</span>
            <span class="info-value">{{ localGeneralInfo.passport_number || 'Не указано' }}</span>
          </div>

          <div class="info-item">
            <span class="info-label">ИНН:</span>
            <span class="info-value">{{ localGeneralInfo.inn || 'Не указано' }}</span>
          </div>

          <div class="info-item regions-item" v-if="localGeneralInfo.regions && localGeneralInfo.regions.length > 0">
            <span class="info-label">Регионы:</span>
            <div class="regions-list">
              <span
                v-for="(region, index) in localGeneralInfo.regions"
                :key="index"
                class="region-tag"
              >
                {{ region }}
              </span>
            </div>
          </div>

          <div class="info-item" v-else>
            <span class="info-label">Регионы:</span>
            <span class="info-value">Не указано</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

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
const localGeneralInfo = ref(null)

const fetchGeneralInfo = async () => {
  if (!props.queryId) {
    error.value = 'Query ID не предоставлен'
    return
  }

  loading.value = true
  error.value = null

  try {
    const response = await fetch(`/api/irbis/person_info/${props.queryId}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    localGeneralInfo.value = data
    emit('update-count', data ? 1 : 0)
  } catch (err) {
    error.value = err.message || 'Произошла ошибка при загрузке данных'
    console.error('Error fetching general info:', err)
  } finally {
    loading.value = false
  }
}

watch(() => props.isActive, (isActive) => {
  if (isActive && !localGeneralInfo.value && props.queryId) {
    fetchGeneralInfo()
  }
})

onMounted(() => {
  if (props.isActive && !localGeneralInfo.value && props.queryId) {
    fetchGeneralInfo()
  }
})
</script>

<style scoped>
.general-tab {
  padding: 15px 8px 0;
}

.empty-list {
  color: #8a6d3b;
  background: #fce7c4;
  border: 1px solid #fad292;
  display: flex;
  align-items: center;
  height: 35px;
  padding: 0 10px;
  border-radius: 4px;
  margin: 0 auto 15px;
  width: fit-content;
}

.empty-list svg {
  height: 18px;
  margin-right: 7px;
  fill: #8a6d3b;
}

.general-info-container {
  padding: 0 15px;
  display: flex;
  justify-content: center;
}

.general-info-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  max-width: 800px;
  width: 100%;
}

.info-title {
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
  text-align: center;
  border-bottom: 2px solid #4400ed;
  padding-bottom: 10px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item.regions-item {
  grid-column: 1 / -1;
}

.info-label {
  font-weight: 600;
  color: #666;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 16px;
  color: #333;
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 4px;
  border-left: 3px solid #4400ed;
}

.regions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 5px;
}

.region-tag {
  background: #4400ed;
  color: white;
  padding: 4px 8px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .general-info-card {
    margin: 0 10px;
    padding: 15px;
  }

  .info-title {
    font-size: 18px;
  }

  .info-value {
    font-size: 14px;
  }
}

@media (max-width: 500px) {
  .general-info-container {
    padding: 0 5px;
  }

  .general-info-card {
    padding: 12px;
  }

  .info-title {
    font-size: 16px;
  }
}

/* Loading Styles */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  min-height: 200px;
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error Styles */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  min-height: 200px;
  text-align: center;
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
  max-width: 400px;
}

.retry-button {
  background: #4400ed;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background: #3300cc;
}

.retry-button:active {
  background: #2200aa;
}
</style>