<template>
  <div class="company-report" @click="closeModal">
    <!-- Tab Header -->
    <div class="tab-head" @click="closeModal">
      <div 
        id="head-info" 
        :style="{ height: isHeadInfoExpanded ? '105px' : '28px' }"
        class="head-info-container"
      >
        <h2 
          class="object-full_name" 
          @click="toggleHeadInfo"
          style="display: inline; cursor: pointer;"
        >
          Объект: <span style="white-space: nowrap; text-transform: capitalize;">{{ title }}</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            :style="{ transform: isHeadInfoExpanded ? 'rotateX(0deg)' : 'rotateX(180deg)' }"
            style="width: 15px; margin-bottom: -2px; transition: .15s;"
            viewBox="0 0 448 512"
          >
            <path d="M201.4 342.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 274.7 86.6 137.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/>
          </svg>
        </h2>
        <div class="flex justify-center" style="flex-direction: column; width: 100%;">
          <span class="max-text-length" :title="`Категории поиска: ${searchCategories}`">
            <b>Категории поиска:</b> {{ searchCategories }}
          </span>
          <span class="max-text-length" :title="`Произвольные ключевые слова: ${arbitraryKeywords}`">
            <b>Произвольные ключевые слова:</b> {{ arbitraryKeywords }}
          </span>
          <span class="max-text-length" :title="`Минус-слова: ${minusWords}`">
            <b>Минус-слова:</b> {{ minusWords }}
          </span>
          <span class="max-text-length" :title="`Плюс-слова: ${plusWords}`">
            <b>Плюс-слова:</b> {{ plusWords }}
          </span>
          <span class="max-text-length" :title="`Языки перевода: ${translationLanguages?.join(', ')}`">
            <b>Языки перевода:</b> {{ translationLanguages?.join(', ') }}
          </span>
          <div v-if="extraTitles" v-html="extraTitles"></div>
        </div>
      </div>

      <div class="tabs flex flex-wrap items-center">
        <div 
          v-for="(tab, index) in tabs" 
          :key="index"
          :class="[`tab-${index + 1}`, { selected: selectedTabIndex === index + 1 }]"
          @click="selectTab(index + 1)"
        >
          {{ tab.name }}
          <span class="tab-count">{{ getTabItemCount(tab.key) }}</span>
        </div>
      </div>
    </div>

    <!-- Charts and Social/Document Filters Section -->
    <div style="display: flex; gap: 15px; padding: 15px 15px 0; flex-wrap: wrap; justify-content: center;">
      <!-- Chart Container -->
      <div 
        id="company-chart-container" 
        :style="{ display: selectedTabIndex === 1 ? 'block' : 'none' }"
        style="min-width: 424px; height: 230px; border-radius: 6px; overflow: hidden;"
      ></div>
      
      <!-- Social Media Filter -->
      <div 
        class="socials" 
        :style="{ display: selectedTabIndex === 6 ? 'flex' : 'none' }"
      >
        <div 
          v-for="(social, name) in socialTypes" 
          :key="name"
          :data-social-name="name"
          class="socials_type-info"
          @click="toggleSocialType(name, $event)"
        >
          <svg 
            :class="['social_type', social.class, { selected: social.selected }]"
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 448 512"
          >
            <path :d="social.iconPath"/>
          </svg>
          <span>{{ socialTypeCounts[name] || 0 }}</span>
        </div>
      </div>

      <!-- Document Type Filter -->
      <div 
        class="documents" 
        :style="{ display: selectedTabIndex === 7 ? 'flex' : 'none' }"
      >
        <div 
          v-for="(doc, name) in documentTypes" 
          :key="name"
          :data-document-name="name"
          :title="`Формат - ${name}`"
          class="doc_type-info"
          @click="toggleDocumentType(name, $event)"
        >
          <svg 
            :class="['doc_type', doc.class, { selected: doc.selected }]"
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 512 512"
          >
            <path :d="doc.iconPath"/>
          </svg>
          <span>{{ documentTypeCounts[name] || 0 }}</span>
        </div>
      </div>

      <!-- Other Controls -->
      <div>
        <!-- Hide Social Resources -->
        <label 
          class="parent-prompt-hover"
          style="display: inline-flex; align-items: center; margin: 6px 0; background: white; border-radius: 4px; height: 32px; padding: 0 11px 3px 9px; cursor: pointer; user-select: none;"
        >
          <input 
            id="minus-social-resources" 
            type="checkbox" 
            v-model="hideSocialResources"
            @change="onFilterChange"
            style="margin: 2px 5px 0 0; cursor: pointer;"
          >
          <small class="prompt">Исключает из справки сервисы поиска аккаунтов в соц. сетях: socialbase.ru, bigbookname.com и другие.</small>
          <span style="font-size: 15px;">Скрыть архивы социальных сетей</span>
        </label>

        <!-- Stop Filter -->
        <div style="display: flex; align-items: center;">
          <div style="font-weight: 600; margin-top: 4px; margin-right: 6px; letter-spacing: 1px;">Стоп-фильтр:</div>
          <div 
            class="minus-keywords-block"
            style="margin-top: 5px; display: flex; align-items: center; width: 350px; height: 30px;"
          >
            <div 
              style="position: relative; height: 30px; width: 100%; display: flex;"
              class="parent-prompt"
            >
              <input 
                type="text" 
                v-model="newMinusKeyword"
                @keydown.enter="addMinusKeyword"
                style="height: 30px; outline: none; border: none; padding: 0 10px; font-size: 15px; width: 100%; border-radius: 3px 0 0 3px;"
                placeholder="Минус-слова" 
                id="minus-keyword"
              >
              <small class="prompt">Добавьте стоп-слова для исключения содержащих их материалов. Пример: для исключения всех материалов, содержащих слова "адвокат", "адвокатский", "адвоката", достаточно добавить одно стоп-слово "адвокат".</small>
              <svg 
                xmlns="http://www.w3.org/2000/svg"
                @click="toggleMinusKeywordsModal"
                viewBox="0 0 448 512" 
                style="background: white; width: 20px; fill: #676666; padding-right: 6px; cursor: pointer;"
              >
                <path d="M201.4 342.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 274.7 86.6 137.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/>
              </svg>

              <div :class="['minus-keywords-modal', 'scrollbar', { 'hide-keywords-modal': !showMinusKeywordsModal }]">
                <div 
                  v-for="(keyword, index) in minusKeywords" 
                  :key="index"
                  class="minus-keyword" 
                  @click="removeMinusKeyword(index)"
                >
                  <span :title="keyword">{{ keyword }}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                    <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
                  </svg>
                </div>
                <div v-if="!minusKeywords.length" class="minus-keyword">
                  <span>Список пустой</span>
                </div>
              </div>
            </div>

            <button 
              style="padding: 0 8px; height: 30px; display: flex; align-items: center; border: none; background: rgb(26, 179, 148); color: white; border-radius: 0 3px 3px 0; cursor: pointer;"
              @click="addMinusKeyword"
            >
              Добавить
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Range Slider and Filters -->
    <div class="flex items-center wrap-reverse-container" style="padding: 0 10px;">
      <!-- Similarity Range Slider -->
      <div 
        class="similars-range" 
        :style="{ display: selectedTabIndex === 1 ? 'block' : 'none' }"
        style="padding-left: 20px;"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="clone" style="position: absolute; left: 5px; top: 4px;" viewBox="0 0 512 512">
          <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/>
        </svg>
        <div slider id="slider-distance">
          <div>
            <div inverse-left :style="{ width: startRangePercent + '%' }"></div>
            <div inverse-right :style="{ width: (100 - endRangePercent) + '%' }"></div>
            <div range :style="{ left: startRangePercent + '%', right: (100 - endRangePercent) + '%' }"></div>
            <span thumb :style="{ left: startRangePercent + '%' }"></span>
            <span thumb :style="{ left: endRangePercent + '%' }"></span>
            <div sign :style="{ left: startRangePercent + '%' }">
              <span>{{ startRangeValue }}</span>
            </div>
            <div sign :style="{ left: endRangePercent + '%' }">
              <span>{{ endRangeValue }}</span>
            </div>
          </div>
          <input 
            type="range" 
            :value="startRangeValue" 
            :max="maxRange" 
            :min="minRange" 
            step="1"
            @input="updateStartRange"
            @change="onRangeChange"
          />
          <input 
            type="range" 
            :value="endRangeValue" 
            :max="maxRange" 
            :min="minRange" 
            step="1"
            @input="updateEndRange"
            @change="onRangeChange"
          />
        </div>
      </div>

      <!-- Filter Search Arbitrary -->
      <div 
        class="filter-search-arbitrary" 
        :style="{ display: isFilterableTab() ? 'block' : 'none' }"
      >
        <label class="input">
          <input 
            type="text" 
            v-model="filterSearchQuery"
            placeholder="Введите название ключа" 
            @click="showArbitraryKeys = true"
            @input="updateFilterList"
          />
          <svg 
            @click="toggleArbitraryKeys"
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 448 512"
            :class="{ selected: showArbitraryKeys }"
          >
            <path d="M201.4 342.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 274.7 86.6 137.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/>
          </svg>
          <div :class="['arbitrary-keys', { show: showArbitraryKeys }]">
            <div class="scrollbar">
              <label 
                v-for="key in filteredArbitraryKeys" 
                :key="key"
                class="arbitrary-key"
                :style="{ display: filterCounts[selectedTabIndex] && filterCounts[selectedTabIndex][key] !== undefined ? 'flex' : 'none' }"
              >
                <input 
                  type="checkbox" 
                  :checked="filters[selectedTabIndex] && filters[selectedTabIndex][key]"
                  @click="toggleArbitraryKey($event, key)"
                />
                <span :title="key">{{ key }}</span>
                <div class="filter-count">{{ filterCounts[selectedTabIndex] && filterCounts[selectedTabIndex][key] || 0 }}</div>
              </label>
            </div>
            <div class="filter-btns">
              <span @click="checkAllFilters">Выделить все</span>
              <span @click="uncheckAllFilters">Снять выделение</span>
            </div>
            <div v-if="!isMobile" class="filter-info">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24V264c0 13.3-10.7 24-24 24s-24-10.7-24-24V152c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"/>
              </svg>
              <div class="filter-info_prompt">Выделить только один<br/> через Ctrl + Click</div>
            </div>
          </div>
        </label>
      </div>

      <!-- Pagination -->
      <div class="pagination-container" @click="closeModal">
        <VPagination
          v-if="hasItems"
          :selected_page="currentPage"
          :general_count="totalPages"
          :set_selected_page="setPage"
          :updateList="updateList"
        />
      </div>
    </div>

    <!-- Content Section -->
    <div class="content" @click="closeModal">
      <div 
        v-for="(tab, index) in tabs" 
        :key="index"
        :class="[`tab-content-${index + 1}`, { selected: selectedTabIndex === index + 1 }]"
      >
        <div v-if="!getFilteredItems(tab.key).length" class="empty-list">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/>
          </svg>
          {{ tab.key === 'main' ? 'Недостаточно материалов, перейдите во вкладку «Все материалы»' : 'Недостаточно материалов, перейдите во вкладку «Все материалы»' }}
        </div>

        <div 
          v-for="item in getPaginatedItems(tab.key)" 
          :key="item.link"
          :class="['item-container', { seen_link: seenLinks[item.link] }]"
          :id="makeSafeForCSS(item.link)"
        >
          <div class="item" style="position: relative">
            <!-- Viewed indicator -->
            <svg 
              v-if="seenLinks[item.link]" 
              class="checkmark" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 52 52"
            >
              <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
              <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
            <svg 
              v-else
              class="checkmark unseen" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 52 52"
            >
              <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"></circle>
            </svg>

            <div class="flex items-center">
              <a :href="item.link" target="_blank" class="item-title" :title="item.title">
                {{ item.title }}
              </a>
            </div>
            <div class="item-content">{{ item.content }}</div>
            <div class="item-info" style="display: flex; align-items: center; margin-top: 5px; font-size: 12px;">
              <a 
                :href="item.link" 
                target="_blank" 
                style="color: #4d4dff;" 
                :title="getDomainName(item.link)"
              >
                {{ truncateText(getDomainName(item.link), 20) }}
              </a>

              <span 
                style="margin: 0 .8em; white-space: nowrap; display: flex; align-items: center; cursor: default;" 
                :title="`Вес ссылки: найдено ${item.keyword_list?.length || 0} раз`"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="clone" style="max-width: 12px; min-width: 12px;" viewBox="0 0 512 512">
                  <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/>
                </svg>
                <span style="margin-left: 5px; font-size: 12px;">{{ item.keyword_list?.length || 0 }}</span>
              </span>

              <div class="mt-auto item-keywords">
                <div class="item-param">
                  <div class="query-content" :title="item.keyword_list?.join(', ')">
                    <span style="color: black">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="width: 12px; fill: #9300FF; margin-bottom: -2.1px;">
                        <path d="M336 352c97.2 0 176-78.8 176-176S433.2 0 336 0S160 78.8 160 176c0 18.7 2.9 36.8 8.3 53.7L7 391c-4.5 4.5-7 10.6-7 17v80c0 13.3 10.7 24 24 24h80c13.3 0 24-10.7 24-24V448h40c13.3 0 24-10.7 24-24V384h40c6.4 0 12.5-2.5 17-7l33.3-33.3c16.9 5.4 35 8.3 53.7 8.3zM376 96a40 40 0 1 1 0 80 40 40 0 1 1 0-80z"/>
                      </svg>
                    </span>
                    <template v-if="item.keyword_list && item.keyword_list.length > 0">
                      <template v-for="(query, index) in getFilteredKeywords(item)" :key="index">
                        <span v-if="index > 0" style="color: black; font-size: 17px">, </span>
                        <span 
                          class="query"
                          @click="copyToClipboard(String(query))"
                          :title="String(query)"
                          :style="index === 0 ? 'margin-left: 4px' : ''"
                        >
                          {{ decodeURIComponent(String(query).trim()) }}
                        </span>
                      </template>
                    </template>
                    <small class="prompt">Копировать при клике</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Pagination -->
    <div class="flex" @click="closeModal">
      <div class="pagination-container" style="padding: 0 8px 15px;">
        <VPagination
          v-if="hasItems"
          :selected_page="currentPage"
          :general_count="totalPages"
          :set_selected_page="setPage"
          :updateList="updateList"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, onUnmounted, reactive, ref, watch} from 'vue'
import VPagination from '../UI/VPagination.vue'

// Types
interface Item {
  link: string
  title: string
  content: string
  keyword_list?: string[]
  fullname?: boolean
  social_type?: string
  doc_type?: string
}

interface TabConfig {
  name: string
  key: string
}

interface FilterConfig {
  [key: string]: boolean
}

// Props
const props = defineProps<{
  title: string
  searchCategories?: string
  arbitraryKeywords?: string
  minusWords?: string
  plusWords?: string
  translationLanguages?: string[]
  extraTitles?: string
  items: {
    main?: Item[]
    arbitrary?: Item[]
    negative?: Item[]
    reputation?: Item[]
    connections?: Item[]
    socials?: Item[]
    documents?: Item[]
    all_materials?: Item[]
  }
  filters?: Record<number, FilterConfig>
  fullnameCounters?: Record<string, number[]>
}>()

// Emits
const emit = defineEmits<{
  'item-viewed': [payload: { link: string; timestamp: number }]
  'filter-changed': [payload: { tab: number; filters: FilterConfig }]
}>()

// Constants
const ITEMS_PER_PAGE = 20
const FILTERABLE_TABS = [2, 3, 4, 5, 6, 7, 8]

const tabs: TabConfig[] = [
  { name: 'Главное', key: 'main' },
  { name: 'Произвольные', key: 'arbitrary' },
  { name: 'Негатив', key: 'negative' },
  { name: 'Репутация', key: 'reputation' },
  { name: 'Связи', key: 'connections' },
  { name: 'Соц.сети', key: 'socials' },
  { name: 'Документы', key: 'documents' },
  { name: 'Все материалы', key: 'all_materials' }
]

// Reactive state
const selectedTabIndex = ref(1)
const currentPage = ref(1)
const isHeadInfoExpanded = ref(false)
const onfocused = ref(false)
const seenLinks = reactive<Record<string, boolean>>({})

// Filter state
const filters = reactive<Record<number, FilterConfig>>({ ...props.filters })
const filterCounts = reactive<Record<number, Record<string, number>>>({})
const showArbitraryKeys = ref(false)
const filterSearchQuery = ref('')

// Range slider state
const startRangeValue = ref(0)
const endRangeValue = ref(100)
const minRange = ref(0)
const maxRange = ref(100)

// Minus keywords state
const minusKeywords = ref<string[]>([])
const newMinusKeyword = ref('')
const showMinusKeywordsModal = ref(false)
const hideSocialResources = ref(false)

// Social and document type filters
const socialTypes = reactive({
  'Вконтакте': {
    selected: true,
    class: 'vk',
    iconPath: 'M31.4907 63.4907C0 94.9813 0 145.671 0 247.04V264.96C0 366.329 0 417.019 31.4907 448.509C62.9813 480 113.671 480 215.04 480H232.96C334.329 480 385.019 480 416.509 448.509C448 417.019 448 366.329 448 264.96V247.04C448 145.671 448 94.9813 416.509 63.4907C385.019 32 334.329 32 232.96 32H215.04C113.671 32 62.9813 32 31.4907 63.4907ZM75.6 168.267H126.747C128.427 253.76 166.133 289.973 196 297.44V168.267H244.16V242C273.653 238.827 304.64 205.227 315.093 168.267H363.253C359.313 187.435 351.46 205.583 340.186 221.579C328.913 237.574 314.461 251.071 297.733 261.227C316.41 270.499 332.907 283.63 346.132 299.751C359.357 315.873 369.01 334.618 374.453 354.747H321.44C316.555 337.262 306.614 321.61 292.865 309.754C279.117 297.899 262.173 290.368 244.16 288.107V354.747H238.373C136.267 354.747 78.0267 284.747 75.6 168.267Z'
  },
  'Facebook': {
    selected: true,
    class: 'fb',
    iconPath: 'M400 32H48A48 48 0 0 0 0 80v352a48 48 0 0 0 48 48h137.25V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.27c-30.81 0-40.42 19.12-40.42 38.73V256h68.78l-11 71.69h-57.78V480H400a48 48 0 0 0 48-48V80a48 48 0 0 0-48-48z'
  },
  'Instagram': {
    selected: true,
    class: 'insta',
    iconPath: 'M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z'
  },
  'Telegram': {
    selected: true,
    class: 'tg',
    iconPath: 'M248,8C111.033,8,0,119.033,0,256S111.033,504,248,504,496,392.967,496,256,384.967,8,248,8ZM362.952,176.66c-3.732,39.215-19.881,134.378-28.1,178.3-3.476,18.584-10.322,24.816-16.948,25.425-14.4,1.326-25.338-9.517-39.287-18.661-21.827-14.308-34.158-23.215-55.346-37.177-24.485-16.135-8.612-25,5.342-39.5,3.652-3.793,67.107-61.51,68.335-66.746.153-.655.3-3.1-1.154-4.384s-3.59-.849-5.135-.5q-3.283.746-104.608,69.142-14.845,10.194-26.894,9.934c-8.855-.191-25.888-5.006-38.551-9.123-15.531-5.048-27.875-7.717-26.8-16.291q.84-6.7,18.45-13.7,108.446-47.248,144.628-62.3c68.872-28.647,83.183-33.623,92.511-33.789,2.052-.034,6.639.474,9.61,2.885a10.452,10.452,0,0,1,3.53,6.716A43.765,43.765,0,0,1,362.952,176.66Z'
  },
  'Одноклассники': {
    selected: true,
    class: 'ok',
    iconPath: 'M184.2 177.1c0-22.1 17.9-40 39.8-40s39.8 17.9 39.8 40c0 22-17.9 39.8-39.8 39.8s-39.8-17.9-39.8-39.8zM448 80v352c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V80c0-26.5 21.5-48 48-48h352c26.5 0 48 21.5 48 48zm-305.1 97.1c0 44.6 36.4 80.9 81.1 80.9s81.1-36.2 81.1-80.9c0-44.8-36.4-81.1-81.1-81.1s-81.1 36.2-81.1 81.1zm174.5 90.7c-4.6-9.1-17.3-16.8-34.1-3.6 0 0-22.7 18-59.3 18s-59.3-18-59.3-18c-16.8-13.2-29.5-5.5-34.1 3.6-7.9 16.1 1.1 23.7 21.4 37 17.3 11.1 41.2 15.2 56.6 16.8l-12.9 12.9c-18.2 18-35.5 35.5-47.7 47.7-17.6 17.6 10.7 45.8 28.4 28.6l47.7-47.9c18.2 18.2 35.7 35.7 47.7 47.9 17.6 17.2 46-10.7 28.6-28.6l-47.7-47.7-13-12.9c15.5-1.6 39.1-5.9 56.2-16.8 20.4-13.3 29.3-21 21.5-37z'
  }
})

const documentTypes = reactive({
  'PDF': {
    selected: true,
    class: 'pdf',
    iconPath: 'M64 464H96v48H64c-35.3 0-64-28.7-64-64V64C0 28.7 28.7 0 64 0H229.5c17 0 33.3 6.7 45.3 18.7l90.5 90.5c12 12 18.7 28.3 18.7 45.3V288H336V160H256c-17.7 0-32-14.3-32-32V48H64c-8.8 0-16 7.2-16 16V448c0 8.8 7.2 16 16 16zM176 352h32c30.9 0 56 25.1 56 56s-25.1 56-56 56H192v32c0 8.8-7.2 16-16 16s-16-7.2-16-16V448 368c0-8.8 7.2-16 16-16zm32 80c13.3 0 24-10.7 24-24s-10.7-24-24-24H192v48h16zm96-80h32c26.5 0 48 21.5 48 48v64c0 26.5-21.5 48-48 48H304c-8.8 0-16-7.2-16-16V368c0-8.8 7.2-16 16-16zm32 128c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H320v96h16zm80-112c0-8.8 7.2-16 16-16h48c8.8 0 16 7.2 16 16s-7.2 16-16 16H448v32h32c8.8 0 16 7.2 16 16s-7.2 16-16 16H448v48c0 8.8-7.2 16-16 16s-16-7.2-16-16V432 368z'
  },
  'Word': {
    selected: true,
    class: 'word',
    iconPath: 'M48 448V64c0-8.8 7.2-16 16-16H224v80c0 17.7 14.3 32 32 32h80V448c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16zM64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V154.5c0-17-6.7-33.3-18.7-45.3L274.7 18.7C262.7 6.7 246.5 0 229.5 0H64zm55 241.1c-3.8-12.7-17.2-19.9-29.9-16.1s-19.9 17.2-16.1 29.9l48 160c3 10.2 12.4 17.1 23 17.1s19.9-7 23-17.1l25-83.4 25 83.4c3 10.2 12.4 17.1 23 17.1s19.9-7 23-17.1l48-160c3.8-12.7-3.4-26.1-16.1-29.9s-26.1 3.4-29.9 16.1l-25 83.4-25-83.4c-3-10.2-12.4-17.1-23-17.1s-19.9 7-23 17.1l-25 83.4-25-83.4z'
  },
  'Excel': {
    selected: true,
    class: 'excel',
    iconPath: 'M48 448V64c0-8.8 7.2-16 16-16H224v80c0 17.7 14.3 32 32 32h80V448c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16zM64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V154.5c0-17-6.7-33.3-18.7-45.3L274.7 18.7C262.7 6.7 246.5 0 229.5 0H64zm90.9 233.3c-8.1-10.5-23.2-12.3-33.7-4.2s-12.3 23.2-4.2 33.7L161.6 320l-44.5 57.3c-8.1 10.5-6.3 25.5 4.2 33.7s25.5 6.3 33.7-4.2L192 359.1l37.1 47.6c8.1 10.5 23.2 12.3 33.7 4.2s12.3-23.2 4.2-33.7L222.4 320l44.5-57.3c8.1-10.5 6.3-25.5-4.2-33.7s-25.5-6.3-33.7 4.2L192 280.9l-37.1-47.6z'
  },
  'PowerPoint': {
    selected: true,
    class: 'pptx',
    iconPath: 'M64 464c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16H224v80c0 17.7 14.3 32 32 32h80V448c0 8.8-7.2 16-16 16H64zM64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V154.5c0-17-6.7-33.3-18.7-45.3L274.7 18.7C262.7 6.7 246.5 0 229.5 0H64zm72 208c-13.3 0-24 10.7-24 24V336v56c0 13.3 10.7 24 24 24s24-10.7 24-24V360h44c42 0 76-34 76-76s-34-76-76-76H136zm68 104H160V256h44c15.5 0 28 12.5 28 28s-12.5 28-28 28z'
  },
  'Txt': {
    selected: true,
    class: 'txt',
    iconPath: 'M64 464c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16H224v80c0 17.7 14.3 32 32 32h80V448c0 8.8-7.2 16-16 16H64zM64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V154.5c0-17-6.7-33.3-18.7-45.3L274.7 18.7C262.7 6.7 246.5 0 229.5 0H64zm56 256c-13.3 0-24 10.7-24 24s10.7 24 24 24H264c13.3 0 24-10.7 24-24s-10.7-24-24-24H120zm0 96c-13.3 0-24 10.7-24 24s10.7 24 24 24H264c13.3 0 24-10.7 24-24s-10.7-24-24-24H120z'
  }
})

const socialTypeCounts = reactive<Record<string, number>>({})
const documentTypeCounts = reactive<Record<string, number>>({})

// Computed properties
const isMobile = computed(() => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent)
})

const currentTabKey = computed(() => {
  return tabs[selectedTabIndex.value - 1]?.key || 'main'
})

const hasItems = computed(() => {
  return getFilteredItems(currentTabKey.value).length > 0
})

const totalPages = computed(() => {
  return Math.ceil(getFilteredItems(currentTabKey.value).length / ITEMS_PER_PAGE) || 1
})

const startRangePercent = computed(() => {
  if (maxRange.value === minRange.value) return 0
  return ((startRangeValue.value - minRange.value) / (maxRange.value - minRange.value)) * 100
})

const endRangePercent = computed(() => {
  if (maxRange.value === minRange.value) return 100
  return ((endRangeValue.value - minRange.value) / (maxRange.value - minRange.value)) * 100
})

const filteredArbitraryKeys = computed(() => {
  if (!filters[selectedTabIndex.value]) return []
  
  return Object.keys(filters[selectedTabIndex.value])
    .filter(key => key.toLowerCase().includes(filterSearchQuery.value.toLowerCase()))
    .sort((a, b) => {
      const aIncludes = a.toLowerCase().includes(filterSearchQuery.value.toLowerCase())
      const bIncludes = b.toLowerCase().includes(filterSearchQuery.value.toLowerCase())
      
      if (aIncludes && bIncludes) {
        return a.indexOf(filterSearchQuery.value) - b.indexOf(filterSearchQuery.value)
      }
      return aIncludes ? -1 : (bIncludes ? 1 : 0)
    })
})

// Helper functions
const isFilterableTab = () => {
  return FILTERABLE_TABS.includes(selectedTabIndex.value)
}

const makeSafeForCSS = (name: string): string => {
  return name.replace(/[^a-z0-9]/g, (s) => {
    const c = s.charCodeAt(0)
    if (c === 32) return '-'
    if (c >= 65 && c <= 90) return '_' + s.toLowerCase()
    return '__' + ('000' + c.toString(16)).slice(-4)
  })
}

const getDomainName = (url: string): string => {
  try {
    const a = document.createElement('a')
    a.href = url
    return a.hostname
  } catch {
    return url
  }
}

const truncateText = (text: string, maxLength: number): string => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const copyToClipboard = async (text: string): Promise<void> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return
    }
    
    const inp = document.createElement('input')
    document.body.appendChild(inp)
    inp.value = text
    inp.select()
    document.execCommand('copy')
    inp.remove()
  } catch (error) {
    console.warn('Failed to copy to clipboard:', error)
  }
}

// Tab and filtering functions
const selectTab = (tabIndex: number): void => {
  if (selectedTabIndex.value === tabIndex) return
  
  selectedTabIndex.value = tabIndex
  currentPage.value = 1
  
  // Initialize filter counts for filterable tabs
  if (isFilterableTab()) {
    initializeFilterCounts()
  }
  
  // Emit filter change event
  emit('filter-changed', {
    tab: tabIndex,
    filters: filters[tabIndex] || {}
  })
}

const getTabItemCount = (tabKey: string): number => {
  return getFilteredItems(tabKey).length
}

const getFilteredItems = (tabKey: string): Item[] => {
  const items = props.items[tabKey as keyof typeof props.items] || []
  let filteredItems = [...items]
  
  // Apply minus keywords filter
  if (minusKeywords.value.length) {
    filteredItems = filteredItems.filter(item => 
      !minusKeywords.value.some(keyword => 
        item.title.toLowerCase().includes(keyword) ||
        item.link.toLowerCase().includes(keyword) ||
        item.content.toLowerCase().includes(keyword)
      )
    )
  }
  
  // Apply social resources filter
  if (hideSocialResources.value) {
    const minusSocialResources = [
      'sociumin.com', 'socialbase.ru', 'sociuminfo.com', 'vkanketa.ru',
      'namebook.club', 'bigbookname.com', 'vk.watch', 'vkplaneta.ru'
    ]
    filteredItems = filteredItems.filter(item => 
      !minusSocialResources.some(resource => item.link.toLowerCase().includes(resource))
    )
  }
  
  // Apply range filter for main tab
  if (tabKey === 'main') {
    filteredItems = filteredItems.filter(item => {
      const weight = item.keyword_list?.length || 0
      return weight >= startRangeValue.value && weight <= endRangeValue.value
    })
  }
  
  // Apply social/document type filters
  if (tabKey === 'socials') {
    filteredItems = filteredItems.filter(item => 
      item.social_type && socialTypes[item.social_type as keyof typeof socialTypes]?.selected
    )
  } else if (tabKey === 'documents') {
    filteredItems = filteredItems.filter(item => 
      item.doc_type && documentTypes[item.doc_type as keyof typeof documentTypes]?.selected
    )
  }
  
  // Apply keyword filters for filterable tabs
  if (isFilterableTab() && filters[selectedTabIndex.value]) {
    const activeFilters = Object.entries(filters[selectedTabIndex.value])
      .filter(([_, active]) => active)
      .map(([key, _]) => key)
    
    if (activeFilters.length > 0) {
      filteredItems = filteredItems.filter(item => 
        item.keyword_list?.some(keyword => activeFilters.includes(keyword))
      )
    }
  }
  
  return filteredItems
}

const getPaginatedItems = (tabKey: string): Item[] => {
  if (selectedTabIndex.value !== tabs.findIndex(tab => tab.key === tabKey) + 1) {
    return []
  }
  
  const filteredItems = getFilteredItems(tabKey)
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE
  const end = start + ITEMS_PER_PAGE
  
  return filteredItems.slice(start, end)
}

const getFilteredKeywords = (item: Item): string[] => {
  if (!isFilterableTab() || !filters[selectedTabIndex.value]) {
    return item.keyword_list || []
  }
  
  return item.keyword_list?.filter(keyword => filters[selectedTabIndex.value][keyword]) || []
}

// Filter management functions
const initializeFilterCounts = (): void => {
  const tabKey = currentTabKey.value
  const items = props.items[tabKey as keyof typeof props.items] || []
  
  filterCounts[selectedTabIndex.value] = {}
  
  items.forEach(item => {
    item.keyword_list?.forEach(keyword => {
      if (!filterCounts[selectedTabIndex.value][keyword]) {
        filterCounts[selectedTabIndex.value][keyword] = 0
      }
      filterCounts[selectedTabIndex.value][keyword]++
    })
  })
}

const toggleArbitraryKey = (event: Event, keyName: string): void => {
  const target = event.target as HTMLInputElement
  
  if ((event as any).ctrlKey) {
    // Ctrl+click: select only this key
    Object.keys(filters[selectedTabIndex.value]).forEach(key => {
      filters[selectedTabIndex.value][key] = key === keyName
    })
  } else {
    // Regular click: toggle this key
    filters[selectedTabIndex.value][keyName] = target.checked
  }
  
  currentPage.value = 1
}

const checkAllFilters = (): void => {
  Object.keys(filters[selectedTabIndex.value]).forEach(key => {
    filters[selectedTabIndex.value][key] = true
  })
  currentPage.value = 1
}

const uncheckAllFilters = (): void => {
  Object.keys(filters[selectedTabIndex.value]).forEach(key => {
    filters[selectedTabIndex.value][key] = false
  })
  currentPage.value = 1
}

const updateFilterList = (): void => {
  // Filter list is computed reactively
}

// Social and document type functions
const toggleSocialType = (socialName: string, event: Event): void => {
  if ((event as any).ctrlKey) {
    // Ctrl+click: select only this type
    Object.keys(socialTypes).forEach(key => {
      socialTypes[key as keyof typeof socialTypes].selected = key === socialName
    })
  } else {
    // Regular click: toggle this type
    socialTypes[socialName as keyof typeof socialTypes].selected = 
      !socialTypes[socialName as keyof typeof socialTypes].selected
  }
  
  currentPage.value = 1
  updateSocialTypeCounts()
}

const toggleDocumentType = (docName: string, event: Event): void => {
  if ((event as any).ctrlKey) {
    // Ctrl+click: select only this type
    Object.keys(documentTypes).forEach(key => {
      documentTypes[key as keyof typeof documentTypes].selected = key === docName
    })
  } else {
    // Regular click: toggle this type
    documentTypes[docName as keyof typeof documentTypes].selected = 
      !documentTypes[docName as keyof typeof documentTypes].selected
  }
  
  currentPage.value = 1
  updateDocumentTypeCounts()
}

const updateSocialTypeCounts = (): void => {
  const items = props.items.socials || []
  
  Object.keys(socialTypes).forEach(key => {
    socialTypeCounts[key] = items.filter(item => item.social_type === key).length
  })
}

const updateDocumentTypeCounts = (): void => {
  const items = props.items.documents || []
  
  Object.keys(documentTypes).forEach(key => {
    documentTypeCounts[key] = items.filter(item => item.doc_type === key).length
  })
}

// Range slider functions
const updateStartRange = (event: Event): void => {
  const target = event.target as HTMLInputElement
  startRangeValue.value = Math.min(Number(target.value), endRangeValue.value - 1)
}

const updateEndRange = (event: Event): void => {
  const target = event.target as HTMLInputElement
  endRangeValue.value = Math.max(Number(target.value), startRangeValue.value)
}

const onRangeChange = (): void => {
  currentPage.value = 1
}

// Minus keywords functions
const addMinusKeyword = (): void => {
  const keyword = newMinusKeyword.value.trim().toLowerCase()
  if (keyword && !minusKeywords.value.includes(keyword)) {
    minusKeywords.value.push(keyword)
    newMinusKeyword.value = ''
    currentPage.value = 1
  }
  showMinusKeywordsModal.value = true
}

const removeMinusKeyword = (index: number): void => {
  minusKeywords.value.splice(index, 1)
  currentPage.value = 1
}

const toggleMinusKeywordsModal = (): void => {
  showMinusKeywordsModal.value = !showMinusKeywordsModal.value
}

// UI functions
const toggleHeadInfo = (): void => {
  isHeadInfoExpanded.value = !isHeadInfoExpanded.value
}

const toggleArbitraryKeys = (): void => {
  showArbitraryKeys.value = !showArbitraryKeys.value
  onfocused.value = showArbitraryKeys.value
}

const closeModal = (event?: Event): void => {
  event?.stopPropagation()
  if (onfocused.value) {
    setTimeout(() => {
      showArbitraryKeys.value = false
      onfocused.value = false
    }, 100)
  }
}

const onFilterChange = (): void => {
  currentPage.value = 1
}

// Pagination functions
const setPage = (page: number): void => {
  currentPage.value = page
}

const updateList = (): void => {
  // Reactive computation handles filtering automatically
}

// Viewport tracking for seen links
const checkAllItems = (): void => {
  const elements = document.querySelectorAll('.item-container')
  elements.forEach(element => {
    if (isInViewport(element)) {
      const link = element.id // You might need to decode this back to original link
      if (!seenLinks[link]) {
        seenLinks[link] = true
        emit('item-viewed', { link, timestamp: Date.now() })
        
        const checkmark = element.querySelector('.checkmark.unseen')
        if (checkmark) {
          checkmark.classList.add('seen_scale')
          setTimeout(() => {
            if (checkmark instanceof HTMLElement) {
              checkmark.style.display = 'none'
            }
          }, 1100)
        }
      }
    }
  })
}

const isInViewport = (el: Element): boolean => {
  const rect = el.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

// Lifecycle hooks
onMounted(() => {
  // Initialize range values based on main tab data
  const mainItems = props.items.main || []
  if (mainItems.length) {
    const weights = mainItems
      .map(item => item.keyword_list?.length || 0)
      .filter(w => !isNaN(w) && isFinite(w))
    
    if (weights.length) {
      minRange.value = Math.min(...weights)
      maxRange.value = Math.max(...weights)
      startRangeValue.value = minRange.value
      endRangeValue.value = maxRange.value
    }
  }
  
  // Initialize social and document type counts
  updateSocialTypeCounts()
  updateDocumentTypeCounts()
  
  // Find first tab with items and select it
  const firstTabWithItems = tabs.findIndex(tab => 
    (props.items[tab.key as keyof typeof props.items] || []).length > 0
  )
  
  if (firstTabWithItems !== -1) {
    selectTab(firstTabWithItems + 1)
  }
  
  // Set up scroll listener for tracking viewed items
  window.addEventListener('scroll', checkAllItems, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', checkAllItems)
})

// Watchers
watch(() => props.filters, (newFilters) => {
  if (newFilters) {
    Object.assign(filters, newFilters)
  }
}, { deep: true })

watch(selectedTabIndex, () => {
  currentPage.value = 1
})
</script>

<style scoped>
@import url('https://fonts.cdnfonts.com/css/roboto');

* {
  box-sizing: border-box;
}

.company-report {
  font-family: 'Roboto', Arial, "Helvetica Neue", Helvetica, sans-serif;
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

.justify-center {
  justify-content: center;
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

.head-info-container {
  margin-bottom: 6px;
  transition: .15s;
  overflow: hidden;
  width: 100%;
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

.tab-head .flex > div:not(.tab-head .flex > .pagination) {
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

.tab-head .flex > div:not(.tab-head .flex > .pagination):hover,
.tab-head .flex > .selected {
  border-bottom: 2px solid #4400ed !important;
  color: #4400ed;
}

.tab-head .flex > .selected {
  border-bottom: 2px solid #4400ed !important;
  color: #4400ed !important;
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

.content {
  padding: 15px 8px 0;
}

.content > div.selected {
  display: flex;
  flex-wrap: wrap;
}

.content > div:not(.content > .selected) {
  display: none;
}

.item-container {
  width: 50%;
  padding: 0 8px;
  margin-bottom: 15px;
}

@media (max-width: 1025px) {
  .item-container {
    width: 100%;
  }
}

.filter-search-arbitrary {
  margin-left: 8px;
}

@media (max-width: 570px) {
  .item-container {
    padding: 0 2px;
  }

  .filter-search-arbitrary {
    margin-left: 2px;
  }
}

.item {
  background: white;
  padding: 12px 15px;
  border-radius: 4px;
  box-shadow: 0 0 4px #7f7f7f;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.mt-auto {
  margin-top: auto;
}

.key-word {
  background: #e0ec90;
  padding: 0 4px;
  border-radius: 4px;
}

.item-title {
  font-weight: 600;
  cursor: pointer;
  font-size: 16px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  text-decoration: none;
  color: #333;
}

.item-title:hover {
  text-decoration: underline;
}

.item-content {
  font-size: 13px;
  margin-top: 6px;
  text-align: justify;
  max-height: 80px;
  line-height: 20px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  margin-bottom: auto;
}

.item-more {
  margin-left: auto;
  border: 1px solid #e7eaec;
  font-size: 15px;
  height: 29px;
  padding: 0 8px;
  border-radius: 3px;
  transition: .25s;
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #333;
}

.item-more:hover {
  background: #e7eaec70;
  text-decoration: underline;
}

.item-more svg {
  width: 13px;
  margin-left: 7px;
}

.item-param {
  font-size: 13px;
  display: flex;
  font-weight: 600;
  position: relative;
}

.item-info > a + span,
.item-info > a {
  white-space: nowrap;
  padding-top: 4px;
}

@media (max-width: 425px) {
  .item-info {
    flex-wrap: wrap-reverse;
  }

  .item-keywords {
    width: 100%;
    margin-bottom: 3px;
  }

  .item-info > a + span {
    margin-left: auto !important;
  }
}

.query-content {
  position: relative;
  display: flex;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  text-align: justify;
  color: white;
}

.query {
  color: white;
  background: #9300FF;
  font-size: 11px;
  border-radius: 3px;
  padding: 0 4px 1px 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.prompt {
  position: absolute;
  bottom: calc(100% + 7px);
  right: 0;
  font-size: 11px;
  background: #404f5d;
  color: #fff;
  padding: 3px 5px;
  border-radius: 6px;
  transition: .15s;
  display: none;
  opacity: 0;
}

.prompt::after {
  content: "▶";
  position: absolute;
  top: 100%;
  left: 10px;
  color: #404f5d;
  height: 9px;
  transform: rotate(90deg);
}

.query:hover + .prompt {
  display: block !important;
  opacity: 1 !important;
}

.param-text {
  overflow: hidden;
  margin-left: 8px;
  font-size: 12px;
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
}

.empty-list svg {
  height: 18px;
  margin-right: 7px;
  fill: #8a6d3b;
}

.pagination svg {
  height: 100%;
  display: flex;
  align-items: center;
  margin: 0 3px;
  padding: 6px 0 !important;
  width: 22px;
}

.pagination {
  margin-left: auto;
  display: flex;
  align-items: center;
  font-size: 13px;
  height: 25px;
  user-select: none;
}

.pagination > div > *,
.pagination > *:not(.pagination > div) {
  height: 100%;
  padding: 0 7px;
  display: flex !important;
  align-items: center !important;
  cursor: pointer;
  background: white;
}

.h-full {
  height: 100%;
}

.w-full {
  width: 100%;
}

.w-half {
  width: 50%;
}

.pagination > *:first-child {
  border-radius: 4px 0 0 4px;
}

.pagination > *:last-child {
  border-radius: 0 4px 4px 0;
}

.pagination > div > * {
  border-bottom: 1px solid transparent;
}

.pagination > div > *.selected,
.pagination > div > *:hover {
  border-bottom: 1px solid #3b5998;
  color: #3b5998;
  font-weight: 600;
}

.pagination > .hovered-angle > svg:hover {
  background: #3b5998;
  fill: white;
}

.pagination div span {
  display: flex;
  align-items: center;
}

h2 {
  font-size: 22px;
}

.object-full_name {
  font-size: 21px;
  margin-top: 0;
  margin-bottom: 0;
  margin-right: 10px;
  white-space: nowrap;
}

@media (max-width: 710px) {
  .tab-head > .tabs:not(.tab-head .pagination) {
    margin: 0 -5px;
    font-size: 15px;
  }
}

@media (max-width: 500px) {
  .item-container {
    margin-bottom: 12px;
  }

  .item {
    padding: 8px 11px;
  }

  .item-title {
    font-size: 14px;
  }

  .item-more {
    font-size: 13px;
    height: 25px;
  }

  .item-more svg {
    width: 11px;
    margin-left: 7px;
  }

  .item-content {
    font-size: 11px;
    margin-top: 5px;
    margin-bottom: auto;
    line-height: 17px;
  }

  .item-param {
    font-size: 11px;
    line-height: 14px;
  }
}

.filter-search-arbitrary {
  padding: 15px 8px 0;
  width: 50%;
}

.filter-search-arbitrary .input {
  position: relative;
  display: flex;
  box-shadow: 0 0 4px #7f7f7f;
  max-width: 450px;
  margin: auto;
}

.filter-search-arbitrary .input > input {
  width: 100%;
  height: 28px;
  padding-left: 7px;
  border-radius: 4px;
  border: none;
  outline: none;
}

.filter-search-arbitrary .input svg {
  position: absolute;
  right: 7px;
  top: 0;
  bottom: 0;
  width: 14px;
  display: flex;
  align-items: center;
  height: 100%;
  fill: #706f6f;
  cursor: pointer;
  transition: .15s;
}

.filter-search-arbitrary .input svg:hover {
  fill: black;
}

.filter-search-arbitrary .input.selected svg {
  transform: rotateX(180deg);
}

.scrollbar::-webkit-scrollbar {
  width: 7px;
  height: 6px;
  margin-left: 2px;
}

.scrollbar::-webkit-scrollbar-track {
  margin-left: 2px;
  background-color: transparent;
}

.scrollbar::-webkit-scrollbar-thumb {
  background-color: rgb(170, 227, 255);
  border-radius: 5px;
}

.arbitrary-keys > div:first-child::-webkit-scrollbar {
  width: 7px;
  height: 6px;
  margin-left: 2px;
}

.arbitrary-keys > div:first-child::-webkit-scrollbar-track {
  margin-left: 2px;
  background-color: transparent;
}

.arbitrary-keys > div:first-child::-webkit-scrollbar-thumb {
  background-color: rgb(170, 227, 255);
  border-radius: 5px;
}

.arbitrary-keys {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 5px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 0 4px #7f7f7f;
}

.arbitrary-keys > div:first-child {
  border-radius: 4px;
  min-height: 50px;
  max-height: 270px;
  overflow-y: scroll;
  overflow-x: hidden;
  background: white;
  padding: 8px 10px;
  font-size: 14px;
  position: relative;
  z-index: 5;
}

.arbitrary-keys:not(.arbitrary-keys.show) {
  display: none;
}

.arbitrary-key {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.arbitrary-key span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.arbitrary-key:not(.arbitrary-key:last-child) {
  margin-bottom: 8px;
}

.arbitrary-key input {
  margin: 2px 5px 0 0;
  height: 15px !important;
  width: 15px !important;
  min-width: 15px !important;
  line-height: 1 !important;
  accent-color: #9300FF;
}

.hovered-angle svg {
  transition: .15s;
}

svg.first-page,
svg.last-page {
  margin: 0;
  padding: 6px 0 !important;
  width: 22px;
}

.first-page {
  margin-left: 22px !important;
}

.last-page {
  margin-right: 22px !important;
}

.hovered-angle {
  height: 100%;
}

.pagination {
  border-radius: 4px;
  overflow: hidden;
}

.hovered-angle:not(.hovered-angle:hover) svg.first-page,
.hovered-angle:not(.hovered-angle:hover) svg.last-page {
  width: 0;
}

.hovered-angle:not(.hovered-angle:hover) svg:not(svg.last-page) {
  border-radius: 0 4px 4px 0;
}

.hovered-angle:not(.hovered-angle:hover) svg.first-page + svg {
  border-radius: 4px 0 0 4px;
}

.hovered-angle:hover svg.first-page,
.hovered-angle:hover svg.last-page {
  margin: 0 !important;
}

.pagination-container {
  padding: 15px 8px 0;
  margin: auto;
}

@media (max-width: 670px) {
  .hovered-angle:hover svg:not(svg.last-page) {
    border-radius: 0 4px 4px 0 !important;
  }

  .hovered-angle:hover svg.first-page + svg {
    border-radius: 4px 0 0 4px !important;
  }

  .filter-search-arbitrary {
    width: 100%;
  }

  .wrap-reverse-container {
    flex-wrap: wrap-reverse;
  }

  svg.first-page,
  svg.last-page {
    display: none !important;
  }

  .pagination .flex.h-full {
    max-width: 250px;
    overflow-y: hidden;
    overflow-x: scroll;
    margin-bottom: 0;
    min-height: 34px !important;
  }

  .pagination .flex.h-full > * {
    height: 26px !important;
  }

  .pagination {
    height: 33px;
    margin-bottom: -8px;
  }

  .pagination .hovered-angle {
    padding-bottom: 8px;
  }
}

.filter-btns {
  background: white;
  position: relative;
  z-index: 1;
  border-top: 1px solid #ccc;
  font-size: 15px;
  display: flex;
}

.filter-btns span {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 38px;
  cursor: pointer;
  transition: .15s;
  padding-bottom: 1px;
}

.filter-btns span:first-child {
  border-right: 1px solid #ccc;
}

.filter-btns span:hover {
  color: white;
  background: #9300FF;
}

.filter-info {
  position: absolute !important;
  top: unset !important;
  bottom: 38px !important;
  right: 0 !important;
  margin: 5px;
  z-index: 15;
  width: 19px !important;
  height: 19px !important;
}

.filter-info svg {
  width: 19px !important;
  height: 19px !important;
  fill: rgba(131, 131, 131, 0.58) !important;
  transform: rotateX(0deg) !important;
}

.filter-info svg:hover {
  fill: #838383 !important;
}

.filter-info .filter-info_prompt {
  position: absolute;
  bottom: calc(100% + 9px);
  right: 0;
  background: #838383;
  color: white;
  font-size: 11px;
  white-space: nowrap;
  padding: 3px 5px;
  border-radius: 4px;
  transition: .15s;
}

.filter-info_prompt::after {
  content: "▶";
  position: absolute;
  top: calc(100% - 2px);
  right: 9px;
  color: #838383;
  height: 3px;
  transform: rotate(90deg);
}

.filter-info svg:not(.filter-info svg:hover) + .filter-info_prompt {
  opacity: 0;
  pointer-events: none;
}

.similars-range {
  max-width: 300px;
  width: 100%;
  position: relative;
  margin: 15px 8px 0;
  padding-top: 12px;
  height: 25px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 0 5px rgba(0, 0, 0, .15);
  margin-left: auto !important;
  margin-right: auto !important;
}

.similars-range input {
  position: absolute;
  top: 0;
  left: 0;
}

/* Range */
[slider] {
  position: relative;
  height: 3px;
  border-radius: 10px;
  text-align: left;
  display: flex;
  align-items: center;
}

[slider] > div {
  position: absolute;
  left: 13px;
  right: 15px;
  height: 3px;
}

[slider] > div > [inverse-left] {
  position: absolute;
  left: 0;
  height: 3px;
  border-radius: 10px;
  background-color: #CCC;
  margin: 0 7px;
}

[slider] > div > [inverse-right] {
  position: absolute;
  right: 0;
  height: 3px;
  border-radius: 10px;
  background-color: #CCC;
  margin: 0 7px;
}

[slider] > div > [range] {
  position: absolute;
  left: 0;
  height: 3px;
  border-radius: 14px;
  background-color: #4169e1;
}

[slider] > div > [thumb] {
  position: absolute;
  top: -5px;
  z-index: 2;
  height: 12px;
  width: 12px;
  text-align: left;
  margin-left: -7px;
  cursor: pointer;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.4);
  background-color: #FFF;
  border-radius: 3px;
  outline: none;
}

[slider] > input[type=range] {
  position: absolute;
  pointer-events: none;
  -webkit-appearance: none;
  z-index: 3;
  height: 3px;
  top: -2px;
  width: 100%;
  -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=0)";
  filter: alpha(opacity=0);
  -moz-opacity: 0;
  -khtml-opacity: 0;
  opacity: 0;
}

div[slider] > input[type=range]::-ms-track {
  -webkit-appearance: none;
  background: transparent;
  color: transparent;
}

div[slider] > input[type=range]::-moz-range-track {
  -moz-appearance: none;
  background: transparent;
  color: transparent;
}

div[slider] > input[type=range]:focus::-webkit-slider-runnable-track {
  background: transparent;
  border: transparent;
}

div[slider] > input[type=range]:focus {
  outline: none;
}

div[slider] > input[type=range]::-ms-thumb {
  pointer-events: all;
  width: 28px;
  height: 28px;
  border-radius: 0;
  border: 0 none;
  background: red;
}

div[slider] > input[type=range]::-moz-range-thumb {
  pointer-events: all;
  width: 28px;
  height: 28px;
  border-radius: 0;
  border: 0 none;
  background: red;
}

div[slider] > input[type=range]::-webkit-slider-thumb {
  pointer-events: all;
  width: 28px;
  height: 28px;
  border-radius: 0;
  border: 0 none;
  background: red;
  -webkit-appearance: none;
}

div[slider] > input[type=range]::-ms-fill-lower {
  background: transparent;
  border: 0 none;
}

div[slider] > input[type=range]::-ms-fill-upper {
  background: transparent;
  border: 0 none;
}

div[slider] > input[type=range]::-ms-tooltip {
  display: none;
}

[slider] > div > [sign] {
  font-size: 15px;
  opacity: 0;
  position: absolute;
  margin-left: -13px;
  top: -2.4375em;
  z-index: 3;
  background-color: #4169e1;
  color: #fff;
  width: 1.75em;
  height: 1.75em;
  border-radius: 1.75em;
  -webkit-border-radius: 1.75em;
  align-items: center;
  -webkit-justify-content: center;
  justify-content: center;
  text-align: center;
}

[slider] > div > [sign]:after {
  position: absolute;
  content: '';
  left: 0;
  border-radius: 1em;
  top: calc(1.1875em + 1px);
  border-left: 0.875em solid transparent;
  border-right: 0.875em solid transparent;
  border-top-width: 1em;
  border-top-style: solid;
  border-top-color: #4169e1;
}

[slider] > div > [sign] > span {
  font-size: 10px;
  font-weight: 700;
  line-height: 28px;
}

[slider]:hover > div > [sign] {
  opacity: 1;
}

.clone {
  width: 16px;
  height: 16px;
  fill: #4169e1;
}

.seen_link {
  opacity: 0.8;
}

.seen_link .item {
  box-shadow: none;
  background: #c4d9ce;
}

.filter-count {
  margin-left: auto;
  background: #9300FF;
  color: white;
  padding: 0 4px;
  border-radius: 4px;
  font-size: 13px;
  white-space: nowrap;
}

/* Checkmark animations */
.checkmark__circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 5;
  stroke-miterlimit: 10;
  stroke: #4400ed;
  fill: none;
  animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: block;
  stroke-width: 6.5;
  stroke: #fff;
  stroke-miterlimit: 10;
  box-shadow: inset 0 0 0 #4400ed;
  animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
  margin-right: 5px;
  position: absolute;
  top: -5px;
  left: -5px;
}

.checkmark.unseen {
  top: 6px;
  left: 6px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.checkmark.unseen.seen_scale {
  animation: fill .4s ease-in-out .4s forwards, seen_scale .3s ease-in-out .9s both;
}

.checkmark__check {
  transform-origin: 50% 50%;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}

@keyframes stroke {
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes scale {
  0%,
  100% {
    transform: none;
  }

  50% {
    transform: scale3d(1.1, 1.1, 1);
  }
}

@keyframes seen_scale {
  20% {
    transform: scale3d(1.1, 1.1, 1);
  }

  99% {
    transform: scale3d(0, 0, 0);
  }

  99% {
    display: none;
  }
}

@keyframes fill {
  100% {
    box-shadow: inset 0 0 0 20px #4400ed;
  }
}

.documents,
.socials {
  display: flex;
  align-items: center;
  padding: 0 9px;
  background: white;
  border-radius: 5px;
  height: 40px;
  margin-top: -2.5px;
}

.doc_type,
.social_type {
  width: 19px;
  height: 18px;
  transition: .25s all;
  color: #bbb;
}

.doc_type-info,
.socials_type-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 10px;
  margin-bottom: -1px;
  cursor: pointer;
}

.doc_type-info:not(.doc_type-info:last-child),
.socials_type-info:not(.socials_type-info:last-child) {
  margin-right: 11px;
}

.doc_type {
  fill: #bbb;
}

.doc_type.pdf.selected,
.doc_type.pdf:hover {
  fill: #e10000;
}

.doc_type.word.selected,
.doc_type.word:hover {
  fill: #0583f3;
}

.doc_type.excel.selected,
.doc_type.excel:hover {
  fill: #00ac0f;
}

.doc_type.pptx.selected,
.doc_type.pptx:hover {
  fill: #f2b90a;
}

.doc_type.txt.selected,
.doc_type.txt:hover {
  fill: #444444;
}

.social_type.vk {
  fill: #bbb;
}

.social_type.vk.selected,
.social_type.vk:hover {
  fill: #4a76a8;
}

.social_type.fb {
  fill: #bbb;
}

.social_type.fb.selected,
.social_type.fb:hover {
  fill: #4267b2;
}

.social_type.insta {
  fill: #fff;
  border-radius: 6px;
  background: #bbb;
  padding: 1px;
}

.social_type.insta.selected,
.social_type.insta:hover {
  background: linear-gradient(#a900ff, #ea3701, #ec920b);
}

.social_type.tg {
  fill: #bbb;
}

.social_type.tg.selected,
.social_type.tg:hover {
  fill: #1da1f2;
}

.social_type.ok {
  fill: #bbb;
}

.social_type.ok.selected,
.social_type.ok:hover {
  fill: #ee8208;
}

.max-text-length {
  font-size: 11px;
  max-width: 600px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

/* Minus-Keywords */
.minus-keyword {
  display: flex;
  align-items: center;
  padding: 3px 5px 5px 8px;
  font-size: 14px;
  cursor: default;
}

.minus-keyword span {
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: none;
}

.minus-keyword svg {
  padding: 0 2px 0 4px;
  width: 21px;
  height: 13px;
  cursor: pointer;
}

.minus-keyword svg:hover {
  fill: red;
}

.minus-keyword:hover {
  background: #f5f4f4;
}

.minus-keywords-modal {
  position: absolute;
  top: 100%;
  right: 0;
  left: 0;
  max-height: 150px;
  background: white;
  margin-top: 3px;
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  overflow-x: hidden;
  transition: .15s;
}

.minus-keywords-modal.hide-keywords-modal {
  max-height: 0;
}

.parent-prompt {
  position: relative !important;
}

.parent-prompt input:not(.parent-prompt input:focus) + .prompt {
  opacity: 0;
  display: none;
}

.parent-prompt-hover:hover .prompt {
  display: block !important;
  opacity: 1 !important;
}

.wrap-reverse-container {
  flex-wrap: wrap-reverse;
}
</style>