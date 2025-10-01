<template>
  <div class="irbis-report" @click="closeModal">
    <div class="tab-head" @click="closeModal">
      <div class="flex items-center" style="flex-wrap: wrap;">
        <h2 class="object-full_name">
          Ирбис: <span style="white-space:nowrap">Судебные дела</span>
        </h2>
      </div>

      <div class="tabs flex flex-wrap items-center">
        <div
            v-for="(tab, index) in tabs"
            :key="index"
            :class="[`tab-${index + 1}`, { selected: selectedTabIndex === index + 1 }]"
            @click="selectTab(index + 1)"
        >
          {{ tab }}
          <span class="tab-count">{{ getTabItemCount(index + 1) }}</span>
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
            @update-count="(count) => updateTabCount(2, count)"
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
            @update-count="(count) => updateTabCount(3, count)"
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
            @update-count="(count) => updateTabCount(4, count)"
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
            @update-count="(count) => updateTabCount(5, count)"
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
            @update-count="(count) => updateTabCount(6, count)"
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
            @update-count="(count) => updateTabCount(7, count)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import VIrbisGeneralTab from './tabs/VIrbisGeneralTab.vue';
import VIrbisCourtGeneralTab from './tabs/VIrbisCourtGeneralTab.vue';
import VIrbisArbitrationTab from './tabs/VIrbisArbitrationTab.vue';
import VIrbisBankruptcyTab from './tabs/VIrbisBankruptcyTab.vue';
import VIrbisDisqualifiedTab from './tabs/VIrbisDisqualifiedTab.vue';
import VIrbisPledgesTab from './tabs/VIrbisPledgesTab.vue';
import VIrbisCorruptionTab from './tabs/VIrbisCorruptionTab.vue';

const tabs = [
  'Общее',
  'Суды общей юрисдикции',
  'Арбитражные суды',
  'Банкротства',
  'Дисквалифицированные лица',
  'Залоги',
  'Коррупция'
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

const tabCounts = reactive({
  1: 0, // Общее
  2: '?', // Суды общей юрисдикции
  3: '?', // Арбитражные суды
  4: '?', // Банкротства
  5: '?', // Дисквалифицированные лица
  6: '?', // Залоги
  7: '?' // Коррупция
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
</style>