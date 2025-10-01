<template>
  <div class="disqualified-tab">
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
      <button @click="fetchPersons" class="retry-button">Повторить попытку</button>
    </div>

    <div v-else-if="!persons.length && !loading" class="empty-list">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path
            d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"
        />
      </svg>
      Нет найденных дисквалифицированных лиц!
    </div>

    <div v-else class="persons-list">
      <div
          v-for="person in persons"
          :key="person.id"
          class="person-item"
      >
        <div class="person-header" @click="togglePersonDetails(person.id)">
          <div class="person-main-info">
            <div class="person-name">
              {{ person.fio }}
            </div>
            <div class="legal-name" v-if="person.legal_name && person.legal_name !== person.fio">
              Название организации: {{ person.legal_name }}
            </div>
            <div class="office" v-if="person.office">
              {{ person.office }}
            </div>
          </div>

          <div class="person-meta">
            <div class="disqualification-period">
              <div class="period-label">Период дисквалификации:</div>
              <div class="dates">
                <span v-if="person.start_date_disq">{{ formatDate(person.start_date_disq) }}</span>
                <span v-if="person.start_date_disq && person.end_date_disq"> — </span>
                <span v-if="person.end_date_disq">{{ formatDate(person.end_date_disq) }}</span>
                <span v-if="!person.start_date_disq && !person.end_date_disq" class="no-date">Не указан</span>
              </div>
            </div>
            <div class="article" v-if="person.article">
              <span class="article-label">Статья:</span>
              <span class="article-text">{{ person.article }}</span>
            </div>
            <div class="status-badge" :class="getStatusClass(person)">
              {{ getPersonStatus(person) }}
            </div>
          </div>

          <div class="person-expand">
            <svg
                :class="{ rotated: expandedPersons.includes(person.id) }"
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
            v-if="expandedPersons.includes(person.id)"
            class="person-details"
        >
          <div v-if="loadingDetails[person.id]" class="details-loading">
            <div class="small-spinner"></div>
            <span>Загрузка деталей...</span>
          </div>

          <div v-else-if="detailsErrors[person.id]" class="details-error">
            <div class="error-icon">⚠️</div>
            <div class="error-message">{{ detailsErrors[person.id] }}</div>
            <button @click="retryFetchDetails(person.id)" class="retry-details-button">
              Повторить попытку
            </button>
          </div>

          <div v-else-if="personDetails[person.id]" class="details-content">
            <div class="details-grid">
              <div class="detail-section">
                <h4 class="section-title">Персональная информация</h4>

                <div class="detail-item">
                  <span class="detail-label">ФИО:</span>
                  <span class="detail-value">{{ personDetails[person.id].fio }}</span>
                </div>

                <div
                    class="detail-item"
                    v-if="personDetails[person.id].legal_name && personDetails[person.id].legal_name !== personDetails[person.id].fio"
                >
                  <span class="detail-label">Название организации:</span>
                  <span class="detail-value">{{ personDetails[person.id].legal_name }}</span>
                </div>

                <div class="detail-item">
                  <span class="detail-label">Дата рождения:</span>
                  <span class="detail-value">{{
                      formatDate(personDetails[person.id].birth_date) || 'Не указана'
                    }}</span>
                </div>

                <div class="detail-item">
                  <span class="detail-label">Место рождения:</span>
                  <span class="detail-value">{{ personDetails[person.id].bornplace || 'Не указано' }}</span>
                </div>
              </div>

              <div class="detail-section">
                <h4 class="section-title">Информация о дисквалификации</h4>

                <div class="detail-item">
                  <span class="detail-label">Начало дисквалификации:</span>
                  <span class="detail-value">{{
                      formatDate(personDetails[person.id].start_date_disq) || 'Не указано'
                    }}</span>
                </div>

                <div class="detail-item">
                  <span class="detail-label">Окончание дисквалификации:</span>
                  <span class="detail-value">{{
                      formatDate(personDetails[person.id].end_date_disq) || 'Не указано'
                    }}</span>
                </div>

                <div class="detail-item">
                  <span class="detail-label">Статья:</span>
                  <span class="detail-value">{{ personDetails[person.id].article || 'Не указана' }}</span>
                </div>

                <div class="detail-item">
                  <span class="detail-label">Должность:</span>
                  <span class="detail-value">{{ personDetails[person.id].office || 'Не указана' }}</span>
                </div>

                <div class="detail-item">
                  <span class="detail-label">Подразделение:</span>
                  <span class="detail-value">{{ personDetails[person.id].department || 'Не указано' }}</span>
                </div>
              </div>

              <div
                  class="detail-section"
                  v-if="personDetails[person.id].fio_judge || personDetails[person.id].office_judge"
              >
                <h4 class="section-title">Информация о судье</h4>

                <div class="detail-item" v-if="personDetails[person.id].fio_judge">
                  <span class="detail-label">ФИО судьи:</span>
                  <span class="detail-value">{{ personDetails[person.id].fio_judge }}</span>
                </div>

                <div class="detail-item" v-if="personDetails[person.id].office_judge">
                  <span class="detail-label">Должность судьи:</span>
                  <span class="detail-value">{{ personDetails[person.id].office_judge }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="persons.length > 0" class="pagination-section">
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
const persons = ref([]);
const currentPage = ref(1);
const pageSize = ref(20);

const expandedPersons = ref([]);
const personDetails = ref({});
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

const getPersonStatus = (person) => {
  const now = new Date();
  const endDate = person.end_date_disq ? new Date(person.end_date_disq) : null;

  if (!endDate) {
    return 'Бессрочно';
  }

  if (endDate > now) {
    return 'Действует';
  } else {
    return 'Истекла';
  }
};

const getStatusClass = (person) => {
  const status = getPersonStatus(person);
  switch (status) {
    case 'Действует':
      return 'status-active';
    case 'Истекла':
      return 'status-expired';
    case 'Бессрочно':
      return 'status-permanent';
    default:
      return '';
  }
};

const fetchPersons = async () => {
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

    const response = await fetch('/api/irbis/disqualified_person/data', {
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
    persons.value = data;
  } catch (err) {
    error.value = err.message || 'Произошла ошибка при загрузке данных';
    console.error('Error fetching disqualified persons:', err);
  } finally {
    loading.value = false;
  }
};

const fetchPersonDetails = async (personId) => {
  if (personDetails.value[personId]) return;

  loadingDetails.value[personId] = true;
  detailsErrors.value[personId] = null;

  try {
    const response = await fetch(`/api/irbis/disqualified_person/case_full/${personId}`);

    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status}`);
    }

    personDetails.value[personId] = await response.json();
  } catch (err) {
    console.error('Error fetching person details:', err);
    detailsErrors.value[personId] = err.message || 'Произошла ошибка при загрузке деталей';
  } finally {
    loadingDetails.value[personId] = false;
  }
};

const retryFetchDetails = (personId) => {
  delete personDetails.value[personId];
  delete detailsErrors.value[personId];
  fetchPersonDetails(personId);
};

const togglePersonDetails = (personId) => {
  const index = expandedPersons.value.indexOf(personId);
  if (index > -1) {
    expandedPersons.value.splice(index, 1);
  } else {
    expandedPersons.value.push(personId);
    fetchPersonDetails(personId);
  }
};

const changePage = (page) => {
  if (page < 1) return;
  currentPage.value = page;
  fetchPersons();
};

watch(() => props.isActive, (isActive) => {
  if (isActive && persons.value.length === 0 && props.queryId) {
    fetchPersons();
  }
});

onMounted(() => {
  if (props.isActive && props.queryId) {
    fetchPersons();
  }
});
</script>

<style scoped>
.disqualified-tab {
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

/* Persons List */
.persons-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.person-item {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.person-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #eee;
}

.person-header:hover {
  background-color: #f8f9fa;
}

.person-main-info {
  flex: 1;
}

.person-name {
  font-weight: 600;
  font-size: 16px;
  color: #333;
  margin-bottom: 4px;
}

.legal-name {
  font-size: 14px;
  color: #4400ed;
  font-weight: 500;
  margin-bottom: 4px;
}

.office {
  font-size: 14px;
  color: #666;
}

.person-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  margin-right: 20px;
  min-width: 250px;
}

.disqualification-period {
  text-align: right;
}

.period-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
}

.dates {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.no-date {
  color: #999;
  font-style: italic;
}

.article {
  text-align: right;
}

.article-label {
  font-size: 12px;
  color: #666;
  margin-right: 4px;
}

.article-text {
  font-size: 13px;
  color: #333;
  font-weight: 500;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  min-width: 80px;
}

.status-active {
  background: #dc3545;
  color: white;
}

.status-expired {
  background: #28a745;
  color: white;
}

.status-permanent {
  background: #6c757d;
  color: white;
}

.person-expand svg {
  width: 16px;
  height: 16px;
  fill: #666;
  transition: transform 0.2s;
}

.person-expand svg.rotated {
  transform: rotate(180deg);
}

/* Person Details */
.person-details {
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
  .person-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .person-meta {
    align-items: flex-start;
    margin-right: 0;
    min-width: auto;
    width: 100%;
  }

  .disqualification-period,
  .article {
    text-align: left;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .pagination-section {
    flex-direction: column;
    gap: 10px;
  }
}
</style>