<template>
  <div class="person-report" @click="closeModal">
    <!-- Tab Header -->
    <div class="tab-head" @click="closeModal">
      <div class="head-info" :style="{ height: headInfoExpanded ? '105px' : '28px' }">
        <h2 class="object-full_name" @click="toggleHeadInfo">
          Объект: <span>{{ objectName }}</span>
          <svg xmlns="http://www.w3.org/2000/svg" :style="{ transform: headInfoExpanded ? 'rotateX(180deg)' : 'rotateX(0deg)' }" viewBox="0 0 448 512">
            <path d="M201.4 342.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 274.7 86.6 137.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/>
          </svg>
        </h2>
        <div class="info-details">
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
          <span class="max-text-length" :title="`Языки перевода: ${translationLanguages.join(', ')}`">
            <b>Языки перевода:</b> {{ translationLanguages.join(', ') }}
          </span>
        </div>
      </div>

      <div class="tabs flex flex-wrap items-center">
        <div 
          :class="['tab-1', { selected: selectedTabIndex === 1 }]" 
          @click="selectTab(1)"
        >
          Главное
          <span class="tab-count">{{ items.main?.length || 0 }}</span>
        </div>
        <div 
          :class="['tab-2', { selected: selectedTabIndex === 2 }]" 
          @click="selectTab(2)"
        >
          Произвольные
          <span class="tab-count">{{ items.arbitrary?.length || 0 }}</span>
        </div>
        <div 
          :class="['tab-3', { selected: selectedTabIndex === 3 }]" 
          @click="selectTab(3)"
        >
          Негатив
          <span class="tab-count">{{ items.negative?.length || 0 }}</span>
        </div>
        <div 
          :class="['tab-4', { selected: selectedTabIndex === 4 }]" 
          @click="selectTab(4)"
        >
          Репутация
          <span class="tab-count">{{ items.reputation?.length || 0 }}</span>
        </div>
        <div 
          :class="['tab-5', { selected: selectedTabIndex === 5 }]" 
          @click="selectTab(5)"
        >
          Связи
          <span class="tab-count">{{ items.connections?.length || 0 }}</span>
        </div>
        <div 
          :class="['tab-6', { selected: selectedTabIndex === 6 }]" 
          @click="selectTab(6)"
        >
          Соц.сети
          <span class="tab-count">{{ items.socials?.length || 0 }}</span>
        </div>
        <div 
          :class="['tab-7', { selected: selectedTabIndex === 7 }]" 
          @click="selectTab(7)"
        >
          Документы
          <span class="tab-count">{{ items.documents?.length || 0 }}</span>
        </div>
        <div 
          :class="['tab-8', { selected: selectedTabIndex === 8 }]" 
          @click="selectTab(8)"
        >
          Все материалы
          <span class="tab-count">{{ items.all_materials?.length || 0 }}</span>
        </div>
      </div>
    </div>

    <!-- Charts and Statistics -->
    <div v-if="selectedTabIndex === 1" class="charts-section">
      <div class="chart-container" id="highcharts-container"></div>
      
      <!-- Social Networks Stats -->
      <div class="socials" v-if="socialStats && Object.keys(socialStats).length > 0">
        <div class="socials_type-info" v-for="(count, social) in socialStats" :key="social">
          <svg class="social_type selected" :class="social">
            <!-- Social network icons would be rendered here based on type -->
          </svg>
          <span>{{ count }}</span>
        </div>
      </div>

      <!-- Document Types Stats -->
      <div class="documents" v-if="documentStats && Object.keys(documentStats).length > 0">
        <div class="doc_type-info" v-for="(count, docType) in documentStats" :key="docType">
          <svg class="doc_type selected" :class="docType">
            <!-- Document type icons would be rendered here based on type -->
          </svg>
          <span>{{ count }}</span>
        </div>
      </div>

      <!-- Fullname Match Filter -->
      <div class="fullname-filter">
        <div class="filter-title">Совпадения:</div>
        <label>
          <input type="radio" v-model="fullnameFilter" value="all" @change="updateFullnameFilter">
          все данные <span>{{ fullnameCounters.all || 0 }}</span>
        </label>
        <label>
          <input type="radio" v-model="fullnameFilter" value="full" @change="updateFullnameFilter">
          полное совпадение <span>{{ fullnameCounters.full || 0 }}</span>
        </label>
        <label>
          <input type="radio" v-model="fullnameFilter" value="partial" @change="updateFullnameFilter">
          частичное совпадение <span>{{ fullnameCounters.partial || 0 }}</span>
        </label>
      </div>

      <!-- Social Archives Filter -->
      <label class="social-archives-filter">
        <input type="checkbox" v-model="hideSocialArchives" @change="updateFilters">
        <span>Скрыть архивы социальных сетей</span>
      </label>

      <!-- Weight Filter -->
      <div class="weight-filter">
        <span class="filter-label">Фильтр:</span>
        <select v-model="weightFilter" @change="updateWeightFilter">
          <option value="all">Все источники</option>
          <option value="weight">Вес источника</option>
        </select>
        <select v-if="weightFilter === 'weight'" v-model="sortDirection" @change="updateSortDirection">
          <option value="desc">По убыванию</option>
          <option value="asc">По возрастанию</option>
        </select>
      </div>

      <!-- Minus Keywords Filter -->
      <div class="minus-keywords-section">
        <div class="filter-label">Стоп-фильтр:</div>
        <div class="minus-keywords-input">
          <input 
            id="minus-keyword" 
            v-model="newMinusKeyword" 
            @keydown.enter="addMinusKeyword"
            placeholder="Введите стоп-слово"
          >
          <button @click="addMinusKeyword">Добавить</button>
        </div>
        <div class="minus-keywords-list" v-if="minusKeywords.length > 0">
          <div 
            v-for="(keyword, index) in minusKeywords" 
            :key="index" 
            class="minus-keyword"
          >
            <span>{{ keyword }}</span>
            <svg @click="removeMinusKeyword(index)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
              <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="content">
      <!-- Tab Content -->
      <div 
        v-for="tabIndex in [1, 2, 3, 4, 5, 6, 7, 8]" 
        :key="tabIndex"
        :class="[`tab-content-${tabIndex}`, { selected: selectedTabIndex === tabIndex }]"
      >
        <div v-if="!getTabItems(tabIndex).length" class="empty-list">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/>
          </svg>
          Нет найденных результатов!
        </div>

        <!-- Items List -->
        <div 
          v-for="item in getTabItems(tabIndex)" 
          :key="item.link"
          :class="['item-container', { seen_link: seenLinks[item.link] }]"
          :id="makeSafeForCSS(item.link)"
        >
          <div class="item">
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
              <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
            </svg>

            <div class="flex items-center">
              <a :href="item.link" target="_blank" class="item-title" :title="item.title">
                {{ item.title }}
              </a>
            </div>
            
            <div class="item-content">{{ item.content }}</div>
            
            <div class="item-info">
              <a :href="item.link" target="_blank" :title="getDomainName(item.link)">
                {{ truncateText(getDomainName(item.link), 20) }}
              </a>

              <div class="item-keywords" v-if="item.keyword_list?.length">
                <div class="item-param">
                  <div class="query-content">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                      <path d="M336 352c97.2 0 176-78.8 176-176S433.2 0 336 0S160 78.8 160 176c0 18.7 2.9 36.8 8.3 53.7L7 391c-4.5 4.5-7 10.6-7 17v80c0 13.3 10.7 24 24 24h80c13.3 0 24-10.7 24-24V448h40c13.3 0 24-10.7 24-24V384h40c6.4 0 12.5-2.5 17-7l33.3-33.3c16.9 5.4 35 8.3 53.7 8.3zM376 96a40 40 0 1 1 0 80 40 40 0 1 1 0-80z"/>
                    </svg>
                    <template v-for="(query, index) in item.keyword_list" :key="index">
                      <span v-if="index > 0">, </span>
                      <span 
                        class="query"
                        @click="copyToClipboard(String(query))"
                        :title="String(query)"
                      >
                        {{ String(query) }}
                      </span>
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

    <!-- Pagination -->
    <div v-if="hasItemsForCurrentTab" class="pagination-container">
      <VPagination
        :selected_page="currentPage"
        :general_count="filteredItems.length"
        :set_selected_page="setPage"
        :updateList="updateList"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import VPagination from '../UI/VPagination.vue'

// Types
interface Item {
  link: string
  title: string
  content: string
  keyword_list?: string[]
  link_weight?: number | string
}

interface PersonItems {
  main?: Item[]
  arbitrary?: Item[]
  negative?: Item[]
  reputation?: Item[]
  connections?: Item[]
  socials?: Item[]
  documents?: Item[]
  all_materials?: Item[]
}

interface FullnameCounters {
  all: number
  full: number
  partial: number
}

// Props
const props = defineProps<{
  objectName: string
  searchCategories: string
  arbitraryKeywords: string
  minusWords: string
  plusWords: string
  translationLanguages: string[]
  items: PersonItems
  fullnameCounters: FullnameCounters
  socialStats?: Record<string, number>
  documentStats?: Record<string, number>
}>()

// Emits
const emit = defineEmits<{
  'item-viewed': [payload: { link: string; timestamp: number }]
  'filter-changed': [payload: { tab: number; filters: any }]
}>()

// Constants
const ITEMS_PER_PAGE = 20
const TAB_NAMES = {
  1: 'main',
  2: 'arbitrary', 
  3: 'negative',
  4: 'reputation',
  5: 'connections',
  6: 'socials',
  7: 'documents',
  8: 'all_materials'
} as const

// State management
const selectedTabIndex = ref(1)
const headInfoExpanded = ref(false)
const seenLinks = reactive<Record<string, boolean>>({})
const currentPage = ref(1)

// Filter states
const fullnameFilter = ref<'all' | 'full' | 'partial'>('all')
const hideSocialArchives = ref(false)
const weightFilter = ref<'all' | 'weight'>('all')
const sortDirection = ref<'asc' | 'desc'>('desc')
const minusKeywords = ref<string[]>([])
const newMinusKeyword = ref('')

// Check if current tab has items to show controls
const hasItemsForCurrentTab = computed(() => {
  const tabItems = getTabItems(selectedTabIndex.value)
  return tabItems.length > 0
})

// Get items for specific tab
const getTabItems = (tabIndex: number): Item[] => {
  const tabName = TAB_NAMES[tabIndex as keyof typeof TAB_NAMES] || 'main'
  return props.items[tabName as keyof PersonItems] || []
}

// Filtered items based on current filters
const filteredItems = computed((): Item[] => {
  let items = getTabItems(selectedTabIndex.value)

  // Apply fullname filter for main tab
  if (selectedTabIndex.value === 1 && fullnameFilter.value !== 'all') {
    // Filter logic would be implemented based on fullname matching
    items = items.filter(item => {
      // This would contain the actual filtering logic
      return true
    })
  }

  // Apply minus keywords filter
  if (minusKeywords.value.length > 0) {
    items = items.filter(item => {
      const content = (item.title + ' ' + item.content).toLowerCase()
      return !minusKeywords.value.some(keyword => 
        content.includes(keyword.toLowerCase())
      )
    })
  }

  // Apply weight filter and sorting
  if (weightFilter.value === 'weight') {
    items = items.sort((a, b) => {
      const weightA = +(a.link_weight || 0)
      const weightB = +(b.link_weight || 0)
      return sortDirection.value === 'asc' ? weightA - weightB : weightB - weightA
    })
  }

  return items
})

// Paginated items for display
const renderedItems = computed((): Item[] => {
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE
  const end = start + ITEMS_PER_PAGE
  return filteredItems.value.slice(start, end)
})

// Helper functions
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

// Event handlers
const toggleHeadInfo = (event: Event) => {
  event.stopPropagation()
  headInfoExpanded.value = !headInfoExpanded.value
}

const selectTab = (newTabIndex: number): void => {
  if (selectedTabIndex.value === newTabIndex) return
  
  selectedTabIndex.value = newTabIndex
  currentPage.value = 1
  
  emit('filter-changed', {
    tab: newTabIndex,
    filters: {}
  })
}

const closeModal = (event?: Event): void => {
  event?.stopPropagation()
}

const updateFullnameFilter = (): void => {
  currentPage.value = 1
}

const updateFilters = (): void => {
  currentPage.value = 1
}

const updateWeightFilter = (): void => {
  currentPage.value = 1
}

const updateSortDirection = (): void => {
  currentPage.value = 1
}

const addMinusKeyword = (): void => {
  const keyword = newMinusKeyword.value.trim().toLowerCase()
  if (keyword && !minusKeywords.value.includes(keyword)) {
    minusKeywords.value.push(keyword)
    newMinusKeyword.value = ''
    currentPage.value = 1
  }
}

const removeMinusKeyword = (index: number): void => {
  minusKeywords.value.splice(index, 1)
  currentPage.value = 1
}

const setPage = (page: number): void => {
  currentPage.value = page
}

const updateList = (): void => {
  // Reactive computation handles filtering automatically
}

// Viewport tracking
const checkAllItems = (): void => {
  renderedItems.value.forEach(item => {
    const element = document.getElementById(makeSafeForCSS(item.link))
    if (element && isInViewport(element) && !seenLinks[item.link]) {
      seenLinks[item.link] = true
      emit('item-viewed', { link: item.link, timestamp: Date.now() })
      
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
let scrollCleanup: (() => void) | null = null

onMounted(() => {
  const handleScroll = (): void => {
    checkAllItems()
  }
  
  window.addEventListener('scroll', handleScroll, { passive: true })
  
  scrollCleanup = () => {
    window.removeEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  if (scrollCleanup) {
    scrollCleanup()
  }
})

// Watchers
watch(renderedItems, () => {
  nextTick(() => {
    checkAllItems()
  })
})

watch(filteredItems, () => {
  const totalPages = Math.ceil(filteredItems.value.length / ITEMS_PER_PAGE) || 1
  if (currentPage.value > totalPages) {
    currentPage.value = totalPages
  }
})
</script>

<style scoped>
@import url('https://fonts.cdnfonts.com/css/roboto');

* {
  box-sizing: border-box;
}

.person-report {
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
  padding: 12px 12px 0px 18px;
  box-shadow: 0 2.5px 4px rgb(184, 183, 183);
  font-size: 16px;
  padding: 7px 20px 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.head-info {
  margin-bottom: 6px;
  transition: .15s;
  overflow: hidden;
  width: 100%;
}

.object-full_name {
  display: inline;
  cursor: pointer;
  font-size: 21px;
  margin-top: 0;
  margin-bottom: 0;
  margin-right: 10px;
  white-space: nowrap;
}

.object-full_name svg {
  width: 15px;
  margin-bottom: -2px;
  transition: .15s;
}

.info-details {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.max-text-length {
  font-size: 11px;
  max-width: 600px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
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

.charts-section {
  display: flex;
  gap: 15px;
  padding: 15px 15px 0;
  flex-wrap: wrap;
  justify-content: center;
}

.chart-container {
  min-width: 424px;
  height: 230px;
  border-radius: 6px;
  overflow: hidden;
}

.socials,
.documents {
  display: flex;
  align-items: center;
  padding: 0 9px;
  background: white;
  border-radius: 5px;
  height: 40px;
  margin-top: -2.5px;
}

.socials_type-info,
.doc_type-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 10px;
  margin-bottom: -1px;
  cursor: pointer;
}

.socials_type-info:not(:last-child),
.doc_type-info:not(:last-child) {
  margin-right: 11px;
}

.social_type,
.doc_type {
  width: 19px;
  height: 18px;
  transition: .25s all;
  color: #bbb;
  fill: #bbb;
}

.fullname-filter {
  display: flex;
  align-items: center;
  height: 34px;
  font-size: 13.5px;
  background: white;
  padding: 0 10px;
  border-radius: 5px;
  white-space: nowrap;
}

.fullname-filter .filter-title {
  font-size: 16px;
  margin-right: 10px;
}

.fullname-filter label {
  display: flex;
  margin-left: 20px;
}

.social-archives-filter {
  display: inline-flex;
  align-items: center;
  margin: 6px 0;
  background: white;
  border-radius: 4px;
  height: 32px;
  padding: 0 11px 3px 9px;
  cursor: pointer;
  user-select: none;
}

.social-archives-filter input {
  margin: 2px 5px 0px 0;
  cursor: pointer;
}

.social-archives-filter span {
  font-size: 15px;
}

.weight-filter {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 6px 0;
  background: white;
  border-radius: 4px;
  height: 32px;
  padding: 0 11px;
}

.filter-label {
  font-weight: 600;
}

.weight-filter select {
  height: 26px;
  border: 1px solid #ddd;
  border-radius: 3px;
  padding: 0 5px;
  outline: none;
  cursor: pointer;
}

.minus-keywords-section {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 6px 0;
}

.minus-keywords-input {
  display: flex;
  gap: 5px;
}

.minus-keywords-input input {
  height: 26px;
  border: 1px solid #ddd;
  border-radius: 3px;
  padding: 0 5px;
  outline: none;
}

.minus-keywords-input button {
  height: 26px;
  border: 1px solid #ddd;
  border-radius: 3px;
  padding: 0 10px;
  background: white;
  cursor: pointer;
}

.minus-keywords-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 5px;
}

.minus-keyword {
  display: flex;
  align-items: center;
  padding: 3px 5px 5px 8px;
  font-size: 14px;
  background: #f5f4f4;
  border-radius: 3px;
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

.content {
  padding: 15px 7.5px 0;
}

.content > div.selected {
  display: flex;
  flex-wrap: wrap;
}

.content > div:not(.selected) {
  display: none;
}

.item-container {
  width: 50%;
  padding: 0 7.5px;
  margin-bottom: 15px;
}

@media (max-width: 1025px) {
  .item-container {
    width: 100%;
  }
}

@media (max-width: 570px) {
  .item-container {
    padding: 0 1.5px;
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
  position: relative;
}

.item-title {
  cursor: pointer;
  font-weight: 600;
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
  margin-bottom: 0px;
  text-align: justify;
  max-height: 80px;
  line-height: 20px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  margin-bottom: auto;
}

.item-info {
  display: flex;
  align-items: center;
  margin-top: 5px;
  font-size: 12px;
}

.item-info > a {
  white-space: nowrap;
  padding-top: 4px;
  color: #4d4dff;
  text-decoration: none;
}

.item-keywords {
  margin-left: 9.6px;
}

.item-param {
  font-size: 13px;
  display: flex;
  font-weight: 600;
  position: relative;
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

.query-content svg {
  width: 12px;
  fill: #9300FF;
  margin-bottom: -2.1px;
}

.query {
  color: white;
  background: #9300FF;
  font-size: 11px;
  border-radius: 3px;
  padding: 0px 4px 1px 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  margin-left: 4px;
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

.pagination-container {
  padding: 15px 7.5px 0;
  margin: auto;
}

.seen_link {
  opacity: 0.8;
}

.seen_link .item {
  box-shadow: none;
  background: #c4d9ce;
}

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
  box-shadow: inset 0px 0px 0px #4400ed;
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
  0%, 100% {
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
  100% {
    display: none;
  }
}

@keyframes fill {
  100% {
    box-shadow: inset 0px 0px 0px 20px #4400ed;
  }
}

@media (max-width: 710px) {
  .tab-head > .tabs:not(.pagination) {
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
</style>