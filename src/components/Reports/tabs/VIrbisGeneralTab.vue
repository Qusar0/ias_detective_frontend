<template>
  <div class="general-tab">
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
      <div class="error-text">
        Ошибка загрузки данных: {{ error }}
      </div>
    </div>

    <div v-else-if="!localStatistics" class="empty-list">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path
            d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"
        />
      </svg>
      Нет данных для отображения!
    </div>

    <div v-else class="results-chart-container">
      <h3 class="chart-title">Распределение результатов по вкладкам</h3>
      <div class="chart-stats">
        <div class="total-results">
          <div class="total-number">{{ totalResults }}</div>
          <div class="total-label">Всего результатов</div>
        </div>
        <div class="chart-bars">
          <div
              v-for="(item, index) in chartData"
              :key="index"
              class="chart-bar-item"
          >
            <div class="bar-label">{{ item.label }}</div>
            <div class="bar-container">
              <div
                  class="bar-fill"
                  :style="{
                    width: item.percentage + '%',
                    background: item.color
                  }"
              >
                <span class="bar-count">{{ item.count }}</span>
              </div>
            </div>
            <div class="bar-percentage">{{ item.percentage }}%</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';

const props = defineProps({
  queryId: {
    type: [String, Number],
    required: false
  },
  isActive: {
    type: Boolean,
    default: false
  },
  statistics: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update-count']);

const loading = ref(false);
const error = ref(null);
const localStatistics = ref(null);

const totalResults = computed(() => {
  if (!localStatistics.value) return 0;
  return (
      (localStatistics.value.court_general || 0) +
      (localStatistics.value.arbitration_court || 0) +
      (localStatistics.value.bankruptcy || 0) +
      (localStatistics.value.disqualified_person || 0) +
      (localStatistics.value.pledgess || 0) +
      (localStatistics.value.corruption || 0)
  );
});

const chartData = computed(() => {
  if (!localStatistics.value) return [];

  const stats = localStatistics.value;
  const total = totalResults.value || 1;

  const colors = [
    '#4400ed', // Суды общей юрисдикции
    '#9300FF', // Арбитражные суды
    '#ef5350', // Банкротства
    '#4caf50', // Дисквалифицированные лица
    '#2196f3', // Залоги
    '#ff9800'  // Коррупция
  ];

  const labels = [
    'Суды общей юрисдикции',
    'Арбитражные суды',
    'Банкротства',
    'Дисквалифицированные лица',
    'Залоги',
    'Коррупция'
  ];

  const keys = ['court_general', 'arbitration_court', 'bankruptcy', 'disqualified_person', 'pledgess', 'corruption'];

  return keys.map((key, index) => {
    const count = stats[key] || 0;
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return {
      label: labels[index],
      count,
      percentage,
      color: colors[index]
    };
  }).filter(item => item.count > 0);
});

const fetchStatistics = async () => {
  if (!props.queryId) {
    error.value = 'Query ID не предоставлен';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const response = await fetch(`/api/irbis/statistic/${props.queryId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    localStatistics.value = data;
    emit('update-count', totalResults.value);
  } catch (err) {
    error.value = err.message || 'Произошла ошибка при загрузке данных';
    console.error('Error fetching statistics:', err);
  } finally {
    loading.value = false;
  }
};

watch(() => props.statistics, (newStats) => {
  if (newStats) {
    localStatistics.value = newStats;
    emit('update-count', totalResults.value);
  }
}, { immediate: true });

watch(() => props.isActive, (isActive) => {
  if (isActive && !localStatistics.value && props.queryId) {
    fetchStatistics();
  }
});

onMounted(() => {
  if (props.statistics) {
    localStatistics.value = props.statistics;
    emit('update-count', totalResults.value);
  } else if (props.isActive && props.queryId) {
    fetchStatistics();
  }
});
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
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

/* Results Chart */
.results-chart-container {
  width: 100%;
  max-width: 800px;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
}

.chart-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px 0;
  text-align: center;
  color: #333;
}

.chart-stats {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.total-results {
  text-align: center;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
}

.total-number {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 5px;
}

.total-label {
  font-size: 14px;
  opacity: 0.9;
}

.chart-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chart-bar-item {
  display: grid;
  grid-template-columns: 180px 1fr 60px;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 6px;
  transition: background 0.2s;
}

.chart-bar-item:hover {
  background: #f5f5f5;
}

.bar-label {
  font-size: 13px;
  font-weight: 500;
  color: #555;
}

.bar-container {
  position: relative;
  height: 28px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
  transition: width 0.5s ease;
  min-width: 30px;
}

.bar-count {
  font-size: 12px;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.bar-percentage {
  font-size: 13px;
  font-weight: 600;
  color: #666;
  text-align: right;
}

@media (max-width: 640px) {
  .chart-bar-item {
    grid-template-columns: 140px 1fr 50px;
    gap: 8px;
  }

  .bar-label {
    font-size: 11px;
  }

  .total-number {
    font-size: 28px;
  }

  .results-chart-container {
    margin: 0 10px;
    padding: 15px;
  }
}
</style>
