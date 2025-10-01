<template>
  <div class="irbis-report" @click="closeModal">
    <div class="tab-head" @click="closeModal">
      <div class="flex items-center" style="flex-wrap: wrap;">
        <h2 class="object-full_name">
          <span style="white-space:nowrap">Судебные дела</span>
        </h2>
      </div>

      <!-- Общая информация вверху страницы -->
      <div v-if="generalInfo" class="general-info-header">
        <div class="info-item">
          <span class="info-label">ФИО:</span>
          <span class="info-value">{{ generalInfo.fullname || 'Не указано' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Дата рождения:</span>
          <span class="info-value">{{ generalInfo.birth_date || 'Не указано' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">ИНН:</span>
          <span class="info-value">{{ generalInfo.inn || 'Не указано' }}</span>
        </div>
        <div class="info-item" v-if="generalInfo.passport_series || generalInfo.passport_number">
          <span class="info-label">Паспорт:</span>
          <span class="info-value">{{ generalInfo.passport_series || '' }} {{ generalInfo.passport_number || '' }}</span>
        </div>
        <div class="info-item" v-if="generalInfo.regions && generalInfo.regions.length > 0">
          <span class="info-label">Регионы:</span>
          <span class="info-value">{{ formatRegions(generalInfo.regions) }}</span>
        </div>
      </div>

      <div class="tabs flex flex-wrap items-center">
        <div
            v-for="(tab, index) in tabs"
            :key="index"
            :class="[`tab-${index + 1}`, { selected: selectedTabIndex === index + 1 }]"
            @click="selectTab(index + 1)"
        >
          {{ tab }}
          <span v-if="index !== 0" class="tab-count">{{ getTabItemCount(index + 1) }}</span>
        </div>
      </div>
    </div>

    <div @click="closeModal">
      <!-- Общее -->
      <div
          :class="['tab-content-1', { selected: selectedTabIndex === 1 }]"
          v-show="selectedTabIndex === 1"
      >
        <VIrbisGeneralTab
            :queryId="queryId"
            :isActive="selectedTabIndex === 1"
            :statistics="statistics"
            @update-count="(count) => updateTabCount(1, count)"
        />
      </div>

      <!-- Суды общей юрисдикции -->
      <div
          :class="['tab-content-2', { selected: selectedTabIndex === 2 }]"
          v-show="selectedTabIndex === 2"
      >
        <VIrbisCourtGeneralTab
            :queryId="queryId"
            :isActive="selectedTabIndex === 2"
            :totalCount="statistics?.court_general || 0"
        />
      </div>

      <!-- Арбитражные суды -->
      <div
          :class="['tab-content-3', { selected: selectedTabIndex === 3 }]"
          v-show="selectedTabIndex === 3"
      >
        <VIrbisArbitrationTab
            :queryId="queryId"
            :isActive="selectedTabIndex === 3"
            :totalCount="statistics?.arbitration_court || 0"
        />
      </div>

      <!-- Банкротства -->
      <div
          :class="['tab-content-4', { selected: selectedTabIndex === 4 }]"
          v-show="selectedTabIndex === 4"
      >
        <VIrbisBankruptcyTab
            :queryId="queryId"
            :isActive="selectedTabIndex === 4"
            :totalCount="statistics?.bankruptcy || 0"
        />
      </div>

      <!-- Дисквалифицированные лица -->
      <div
          :class="['tab-content-5', { selected: selectedTabIndex === 5 }]"
          v-show="selectedTabIndex === 5"
      >
        <VIrbisDisqualifiedTab
            :queryId="queryId"
            :isActive="selectedTabIndex === 5"
            :totalCount="statistics?.disqualified_person || 0"
        />
      </div>

      <!-- Залоги -->
      <div
          :class="['tab-content-6', { selected: selectedTabIndex === 6 }]"
          v-show="selectedTabIndex === 6"
      >
        <VIrbisPledgesTab
            :queryId="queryId"
            :isActive="selectedTabIndex === 6"
            :totalCount="statistics?.pledgess || 0"
        />
      </div>

      <!-- Коррупция -->
      <div
          :class="['tab-content-7', { selected: selectedTabIndex === 7 }]"
          v-show="selectedTabIndex === 7"
      >
        <VIrbisCorruptionTab
            :queryId="queryId"
            :isActive="selectedTabIndex === 7"
            :totalCount="statistics?.corruption || 0"
        />
      </div>

      <!-- Террористы -->
      <div
          :class="['tab-content-8', { selected: selectedTabIndex === 8 }]"
          v-show="selectedTabIndex === 8"
      >
        <VIrbisTerroristsTab
            :queryId="queryId"
            :isActive="selectedTabIndex === 8"
            :totalCount="statistics?.terrorists || 0"
        />
      </div>

      <!-- Налоговые задолженности -->
      <div
          :class="['tab-content-9', { selected: selectedTabIndex === 9 }]"
          v-show="selectedTabIndex === 9"
      >
        <VIrbisTaxArrearsTab
            :queryId="queryId"
            :isActive="selectedTabIndex === 9"
            :totalCount="statistics?.tax_arrears || 0"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import VIrbisGeneralTab from './tabs/VIrbisGeneralTab.vue';
import VIrbisCourtGeneralTab from './tabs/VIrbisCourtGeneralTab.vue';
import VIrbisArbitrationTab from './tabs/VIrbisArbitrationTab.vue';
import VIrbisBankruptcyTab from './tabs/VIrbisBankruptcyTab.vue';
import VIrbisDisqualifiedTab from './tabs/VIrbisDisqualifiedTab.vue';
import VIrbisPledgesTab from './tabs/VIrbisPledgesTab.vue';
import VIrbisCorruptionTab from './tabs/VIrbisCorruptionTab.vue';
import VIrbisTerroristsTab from './tabs/VIrbisTerroristsTab.vue';
import VIrbisTaxArrearsTab from './tabs/VIrbisTaxArrearsTab.vue';

const tabs = [
  'Общее',
  'Суды общей юрисдикции',
  'Арбитражные суды',
  'Банкротства',
  'Дисквалифицированные лица',
  'Залоги',
  'Коррупция',
  'Террористы',
  'Налоговые задолженности'
];

const props = defineProps({
  items: {
    type: Object,
    default: () => ({})
  },
  queryId: {
    type: [String, Number],
    required: false
  }
});

const selectedTabIndex = ref(1);
const generalInfo = ref(null);
const statistics = ref(null);

const tabCounts = reactive({
  1: 0, // Общее
  2: '?', // Суды общей юрисдикции
  3: '?', // Арбитражные суды
  4: '?', // Банкротства
  5: '?', // Дисквалифицированные лица
  6: '?', // Залоги
  7: '?', // Коррупция
  8: '?', // Террористы
  9: '?' // Налоговые задолженности
});

const selectTab = (tabIndex) => {
  selectedTabIndex.value = tabIndex;
};

const closeModal = (event) => {
  event?.stopPropagation();
};

const updateTabCount = (tabIndex, count) => {
  tabCounts[tabIndex] = count;
};

const getTabItemCount = (tabIndex) => {
  return tabCounts[tabIndex];
};

const formatRegions = (regions) => {
  if (!regions || regions.length === 0) return 'Не указаны';
  return regions.map(r => typeof r === 'object' && r.name ? r.name : r).join(', ');
};

const fetchGeneralInfo = async () => {
  if (!props.queryId) return;

  try {
    const response = await fetch(`/api/irbis/person_info/${props.queryId}`);
    if (response.ok) {
      generalInfo.value = await response.json();
    }
  } catch (err) {
    console.error('Error fetching general info:', err);
  }
};

const fetchStatistics = async () => {
  if (!props.queryId) return;

  try {
    const response = await fetch(`/api/irbis/statistic/${props.queryId}`);
    if (response.ok) {
      statistics.value = await response.json();
      if (statistics.value) {
        tabCounts[2] = statistics.value.court_general || 0;
        tabCounts[3] = statistics.value.arbitration_court || 0;
        tabCounts[4] = statistics.value.bankruptcy || 0;
        tabCounts[5] = statistics.value.disqualified_person || 0;
        tabCounts[6] = statistics.value.pledgess || 0;
        tabCounts[7] = statistics.value.corruption || 0;
        tabCounts[8] = statistics.value.terrorists || 0;
        tabCounts[9] = statistics.value.tax_arrears || 0;
      }
    }
  } catch (err) {
    console.error('Error fetching statistics:', err);
  }
};

onMounted(() => {
  fetchGeneralInfo();
  fetchStatistics();
});

</script>

<style scoped>
@import url('https://fonts.cdnfonts.com/css/roboto');

* {
  box-sizing: border-box;
}

.irbis-report {
  font-family: 'Roboto', Arial, "Helvetica Neue", Helvetica, sans-serif;
  width: 100vw;
  margin: 0;
  padding: 0;
  background: #e7e7e7;
  overflow-x: hidden;
}

.flex {
  display: flex;
}

.flex-wrap {
  flex-wrap: wrap;
}

.items-center {
  align-items: center;
}

.tab-head {
  position: relative;
  background: white;
  box-shadow: 0 3px 4px rgb(184, 183, 183);
  font-size: 16px;
  padding: 7px 20px 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

@media (max-width: 640px) {
  .tab-head {
    padding: 7px 8px 0;
    align-items: center;
  }

  .tab-head .tabs {
    justify-content: center;
  }
}

.tab-head .flex div {
  font-size: 1em !important;
}

.tab-head .flex > div[class*="tab-"]:not(.pagination) {
  position: relative;
  padding: .625em .5em;
  margin-right: .8125em;
  cursor: pointer;
  background: white;
  user-select: none;
  color: #747474;
  transition: color .15s;
  margin-top: 4px;
  border-bottom: 2px solid transparent;
}

.tab-head .flex > div[class*="tab-"]:hover,
.tab-head .flex > .selected {
  border-bottom: 2px solid #4400ed !important;
  color: #4400ed;
}

.tab-count {
  position: absolute;
  top: -2px;
  right: -4px;
  display: flex;
  align-items: center;
  padding: 0 3px;
  border-radius: 3px;
  height: 16px;
  font-size: 11px;
  background: #4400ed;
  color: white;
}

.object-full_name {
  font-size: 21px;
  margin-top: 0;
  text-align: center;
  margin-right: 10px;
  margin-bottom: 6px;
}

@media (max-width: 710px) {
  .tab-head > .tabs:not(.pagination) {
    margin: 0 -5px;
    font-size: 15px;
  }
}

/* General Info Header */
.general-info-header {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  padding: 10px 0;
  margin-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.general-info-header .info-item {
  display: flex;
  gap: 5px;
  font-size: 13px;
}

.general-info-header .info-label {
  font-weight: 600;
  color: #666;
}

.general-info-header .info-value {
  color: #333;
}

@media (max-width: 640px) {
  .general-info-header {
    flex-direction: column;
    gap: 8px;
  }
}
</style>