<template>
  <div class="number-report" @click="closeModal">
    <div class="tab-head" @click="closeModal">
      <div class="flex items-center" style="flex-wrap: wrap;">
        <h2 class="object-full_name">
          Номер: <span style="white-space:nowrap">{{ title }}</span>
        </h2>
      </div>

      <div class="tabs flex flex-wrap items-center">
        <div
          :class="['tab-1', { selected: selectedTabIndex === 1 }]"
          @click="selectTab(1)"
        >
          Упоминания
          <span class="tab-count">{{ items.main?.length || 0 }}</span>
        </div>
        <div
          v-if="!isRussianNumber"
          :class="['tab-2', { selected: selectedTabIndex === 2 }]"
          @click="selectTab(2)"
        >
          Теги
          <span class="tab-count">{{ processedTags.length }}</span>
        </div>
        <div
          v-if="osintResults?.length"
          :class="['tab-3', { selected: selectedTabIndex === 3 }]"
          @click="selectTab(3)"
        >
          OSINT
          <span class="tab-count">{{ osintResults.length }}</span>
        </div>
      </div>
    </div>

    <div 
      v-show="hasItemsForCurrentTab"
      class="flex items-center flex-col wrap-reverse-container only-for-mentions"
      style="padding: 0 10px; margin-top: 15px"
    >
      <!-- Sort and Filter Controls -->
      <div class="controls-section" @click="closeModal">
        <div class="sort-controls">
          <button 
            @click="setSortOrder('asc')"
            :class="['sort-btn', { active: sortOrder === 'asc' }]"
            :title="isGroupingEnabled ? 'Сортировать домены по возрастанию' : 'Сортировать ссылки по возрастанию'"
          >
            ↑ {{ isGroupingEnabled ? 'Домены А-Я' : 'Ссылки А-Я' }}
          </button>
          <button 
            @click="setSortOrder('desc')"
            :class="['sort-btn', { active: sortOrder === 'desc' }]"
            :title="isGroupingEnabled ? 'Сортировать домены по убыванию' : 'Сортировать ссылки по убыванию'"
          >
            ↓ {{ isGroupingEnabled ? 'Домены Я-А' : 'Ссылки Я-А' }}
          </button>
          <button 
            @click="toggleGrouping"
            :class="['group-btn', { active: isGroupingEnabled }]"
            title="Группировать по доменам"
          >
            📁 Группировка
          </button>
          <button 
            @click="resetFilters"
            class="reset-btn"
            title="Сбросить фильтры"
          >
            ↺ Сброс
          </button>
        </div>
      </div>

      <div class="pagination-container" @click="closeModal">
        <VPagination
          :selected_page="currentPage"
          :general_count="isGroupingEnabled ? Object.keys(allGroupedItems).length : filteredItems.length"
          :set_selected_page="setPage"
          :updateList="updateList"
        />
      </div>
    </div>

    <!-- Content Section -->
    <div class="content" @click="closeModal">
      <!-- Mentions -->
      <div :class="['tab-content-1', { selected: selectedTabIndex === 1 }]">
        <div v-if="!renderedItems.length" class="empty-list">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z" />
          </svg>
          Нет найденных результатов!
        </div>

        <template v-if="isGroupingEnabled">
          <div 
            v-for="(group, domain) in groupedItems" 
            :key="domain"
            class="domain-group"
          >
            <div 
              class="domain-header"
              @click="toggleDomainExpansion(domain)"
            >
              <span class="domain-toggle">{{ expandedDomains[domain] ? '▼' : '▶' }}</span>
              <span class="domain-name">{{ domain }}</span>
              <span class="domain-count">({{ group.length }})</span>
            </div>
            <div v-if="expandedDomains[domain]" class="domain-items">
              <div 
                v-for="item in group" 
                :key="item.link"
                :class="['item-container', { seen_link: seenLinks[item.link] }]"
                :id="makeSafeForCSS(item.link)"
              >
                <div class="item" style="position:relative">
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
                  <div class="item-info" style="display:flex;align-items:center;margin-top:5px;font-size:12px;">
                    <a :href="item.link" target="_blank" style="color: #4d4dff;" :title="getDomainName(item.link)">
                      {{ truncateText(getDomainName(item.link), 20) }}
                    </a>

                    <div class="mt-auto item-keywords" style="margin-left:9.6px">
                      <div class="item-param">
                        <div class="query-content">
                          <span style="color:black">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="width:12px;fill:#9300FF;margin-bottom: -2.1px;">
                              <path d="M336 352c97.2 0 176-78.8 176-176S433.2 0 336 0S160 78.8 160 176c0 18.7 2.9 36.8 8.3 53.7L7 391c-4.5 4.5-7 10.6-7 17v80c0 13.3 10.7 24 24 24h80c13.3 0 24-10.7 24-24V448h40c13.3 0 24-10.7 24-24V384h40c6.4 0 12.5-2.5 17-7l33.3-33.3c16.9 5.4 35 8.3 53.7 8.3zM376 96a40 40 0 1 1 0 80 40 40 0 1 1 0-80z"/>
                            </svg>
                          </span>
                          <template v-if="item.keyword_list && item.keyword_list.length > 0">
                            <template
                                v-for="(query, index) in item.keyword_list"
                                :key="index"
                            >
                              <span v-if="index > 0" style="color:black;font-size:17px">, </span>
                              <span 
                                class="query"
                                @click="copyToClipboard(String(query))"
                                :title="String(query)"
                                :style="index === 0 ? 'margin-left:4px' : ''"
                              >
                                {{ String(query) }}
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
        </template>

        <div 
          v-else
          v-for="item in renderedItems" 
          :key="item.link"
          :class="['item-container', { seen_link: seenLinks[item.link] }]"
          :id="makeSafeForCSS(item.link)"
        >
          <div class="item" style="position:relative">
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
            <div class="item-info" style="display:flex;align-items:center;margin-top:5px;font-size:12px;">
              <a :href="item.link" target="_blank" style="color: #4d4dff;" :title="getDomainName(item.link)">
                {{ truncateText(getDomainName(item.link), 20) }}
              </a>

              <div class="mt-auto item-keywords" style="margin-left:9.6px">
                <div class="item-param">
                  <div class="query-content">
                    <span style="color:black">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="width:12px;fill:#9300FF;margin-bottom: -2.1px;">
                        <path d="M336 352c97.2 0 176-78.8 176-176S433.2 0 336 0S160 78.8 160 176c0 18.7 2.9 36.8 8.3 53.7L7 391c-4.5 4.5-7 10.6-7 17v80c0 13.3 10.7 24 24 24h80c13.3 0 24-10.7 24-24V448h40c13.3 0 24-10.7 24-24V384h40c6.4 0 12.5-2.5 17-7l33.3-33.3c16.9 5.4 35 8.3 53.7 8.3zM376 96a40 40 0 1 1 0 80 40 40 0 1 1 0-80z"/>
                      </svg>
                    </span>
                    <template v-if="item.keyword_list && item.keyword_list.length > 0">
                      <template
                          v-for="(query, index) in item.keyword_list"
                          :key="index"
                      >
                        <span v-if="index > 0" style="color:black;font-size:17px">, </span>
                        <span 
                          class="query"
                          @click="copyToClipboard(String(query))"
                          :title="String(query)"
                          :style="index === 0 ? 'margin-left:4px' : ''"
                        >
                          {{ String(query) }}
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

      <!-- Tags -->
      <div :class="['tab-content-2', { selected: selectedTabIndex === 2 }]" style="overflow-x: scroll;min-height: calc(100vh - 103px);">
        <div>
          <div class="leaks" style="margin-bottom: 15px;margin-left:10px;">
            <div class="leak-description">
              <span class="f-w-600">
                {{ processedTags.length ? 'Теги из популярных мобильных приложений определения звонящего:' : 'Нет тегов из популярных мобильных приложений' }}
              </span>
            </div>
            <div class="flex">
              <div v-if="processedTags.length" class="flex flex-col">
                <span 
                  v-for="(tag, index) in processedTags" 
                  :key="index"
                  class="leak" 
                  style="position: relative;"
                >
                  {{ tag.name }}
                  <div v-if="tag.count > 1" class="tag-repeated-count">{{ tag.count }}</div>
                </span>
              </div>
              <span v-else>...</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 3: OSINT -->
      <div :class="['tab-content-3', { selected: selectedTabIndex === 3 }]">
        <table 
          v-if="osintResults?.length" 
          style="border-radius: 7px;overflow: hidden;margin-right: auto;margin-left: auto;outline: 1px solid #a7a3a3;margin-bottom: 15px;" 
          cellspacing="0"
        >
          <tbody style="margin: 5px 8px;">
            <tr>
              <th style="width: 250px;height: 45px;background: #c4d9ce;border-right: 1px solid #939393;border-bottom: 1px solid #939393;">
                Проверка
              </th>
              <th style="height: 45px;background: #c4d9ce;border-bottom: 1px solid #939393;">
                Результат
              </th>
            </tr>
            <tr v-for="(result, index) in osintResults" :key="index">
              <td class="td-key">{{ result.check }}</td>
              <td class="td-result" v-html="result.result"></td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-list">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z" />
          </svg>
          Нет данных OSINT проверок
        </div>
      </div>
    </div>

    <div 
      v-show="selectedTabIndex === 1 && hasItemsForCurrentTab" 
      class="flex only-for-mentions" 
      @click="closeModal"
    >
      <div class="pagination-container" style="padding: 0 7.5px 15px;">
        <VPagination
          :selected_page="currentPage"
          :general_count="isGroupingEnabled ? Object.keys(allGroupedItems).length : filteredItems.length"
          :set_selected_page="setPage"
          :updateList="updateList"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import VPagination from '../UI/VPagination.vue'

interface Item {
  link: string
  title: string
  content: string
  keyword_list?: string[]
  link_weight?: number | string
}

interface FilterConfig {
  [key: string]: boolean
}

interface TagData {
  name: string
  count: number
}

interface OSINTResult {
  check: string
  result: string
}

const props = defineProps<{
  title: string
  items: {
    main?: Item[]
    arbitrary?: Item[]
  }
  filters?: Record<number, FilterConfig>
  tags?: string[]
  osintResults?: OSINTResult[]
  lampyreHtml?: string
}>()

const emit = defineEmits<{
  'item-viewed': [payload: { link: string; timestamp: number }]
  'filter-changed': [payload: { tab: number; filters: FilterConfig }]
}>()

const TAB_NAMES = {
  1: 'main',
  2: 'arbitrary'
} as const

const FILTERABLE_TABS = [1, 2] as const
const ITEMS_PER_PAGE = 20

type TabIndex = keyof typeof TAB_NAMES

const selectedTabIndex = ref(1)
const searchQuery = ref('')
const showArbitraryKeys = ref(false)
const onfocused = ref(false)
const seenLinks = reactive<Record<string, boolean>>({})
const tempLinkClasses = reactive<Record<string, string>>({})

const startRangeValue = ref(0)
const endRangeValue = ref(100)
const minRange = ref(0)
const maxRange = ref(100)

const currentPage = ref(1)

const filters = reactive<Record<number, FilterConfig>>({ ...props.filters })

const sortOrder = ref<'none' | 'asc' | 'desc'>('none')
const isGroupingEnabled = ref(false)
const expandedDomains = reactive<Record<string, boolean>>({})

const originalItems = ref<Item[]>([])

const hasItemsForCurrentTab = computed(() => {
  if (selectedTabIndex.value === 1) {
    return (props.items.main?.length || 0) > 0
  } else if (selectedTabIndex.value === 2) {
    return processedTags.value.length > 0
  } else if (selectedTabIndex.value === 3) {
    return (props.osintResults?.length || 0) > 0
  }
  return false
})

let scrollCleanup: (() => void) | null = null

const isRussianNumber = computed((): boolean => {
  const number = props.title
  return number.startsWith('+7') && !number.startsWith('+77') && number.length === 12
})

const processedTags = computed((): TagData[] => {
  if (!props.tags?.length) return []

  const tagCounts: Record<string, TagData> = {}
  props.tags.forEach(tag => {
    if (tagCounts[tag]) {
      tagCounts[tag].count++
    } else {
      tagCounts[tag] = { name: tag, count: 1 }
    }
  })

  return Object.values(tagCounts).sort((a, b) => b.count - a.count)
})
computed((): string[] => {
  if (!filters[selectedTabIndex.value]) return []

  return Object.keys(filters[selectedTabIndex.value])
      .filter(key => key.toLowerCase().includes(searchQuery.value.toLowerCase()))
      .sort((a, b) => {
        const aIncludes = a.toLowerCase().includes(searchQuery.value.toLowerCase())
        const bIncludes = b.toLowerCase().includes(searchQuery.value.toLowerCase())

        if (aIncludes && bIncludes) {
          return a.indexOf(searchQuery.value) - b.indexOf(searchQuery.value)
        }
        return aIncludes ? -1 : (bIncludes ? 1 : 0)
      })
});

const filteredItems = computed((): Item[] => {
  const tabName = getTabName(selectedTabIndex.value)
  let tempItems = [...(props.items[tabName as keyof typeof props.items] || [])]

  if (selectedTabIndex.value === 1) {
    tempItems = tempItems.filter(item => {
      const weight = +(item.link_weight || 0)
      return weight >= startRangeValue.value && weight <= endRangeValue.value
    })
  } else if (isFilterableTab()) {
    tempItems = tempItems.filter(item => 
      item.keyword_list?.some(keyword => filters[selectedTabIndex.value]?.[keyword])
    )
  }

  if (!isGroupingEnabled.value) {
    if (sortOrder.value === 'asc') {
      tempItems.sort((a, b) => a.link.localeCompare(b.link))
    } else if (sortOrder.value === 'desc') {
      tempItems.sort((a, b) => b.link.localeCompare(a.link))
    }
  }

  return tempItems
})

const allGroupedItems = computed(() => {
  if (!isGroupingEnabled.value) return {}
  
  const groups: Record<string, Item[]> = {}

  filteredItems.value.forEach(item => {
    const domain = getDomainName(item.link)
    if (!groups[domain]) {
      groups[domain] = []
    }
    groups[domain].push(item)
  })

  const sortedGroups: Record<string, Item[]> = {}
  let domainKeys = Object.keys(groups)
  
  if (sortOrder.value === 'asc') {
    domainKeys = domainKeys.sort((a, b) => a.localeCompare(b))
  } else if (sortOrder.value === 'desc') {
    domainKeys = domainKeys.sort((a, b) => b.localeCompare(a))
  } else {
    domainKeys = domainKeys.sort((a, b) => a.localeCompare(b))
  }
  
  domainKeys.forEach(domain => {
    sortedGroups[domain] = groups[domain]
  })
  
  return sortedGroups
})

const paginatedDomains = computed(() => {
  if (!isGroupingEnabled.value) return []
  
  const domains = Object.keys(allGroupedItems.value)
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE
  const end = start + ITEMS_PER_PAGE
  
  return domains.slice(start, end)
})

const groupedItems = computed(() => {
  if (!isGroupingEnabled.value) return {}
  
  const pageGroups: Record<string, Item[]> = {}
  
  paginatedDomains.value.forEach(domain => {
    if (allGroupedItems.value[domain]) {
      pageGroups[domain] = allGroupedItems.value[domain]
    }
  })
  
  return pageGroups
})

const renderedItems = computed((): Item[] => {
  if (isGroupingEnabled.value) {
    const allPageItems: Item[] = []
    
    paginatedDomains.value.forEach(domain => {
      if (allGroupedItems.value[domain]) {
        allPageItems.push(...allGroupedItems.value[domain])
      }
    })

    if (isFilterableTab()) {
      const hasActiveFilters = filters[selectedTabIndex.value] && 
        Object.values(filters[selectedTabIndex.value]).some(active => active)
      
      if (hasActiveFilters) {
        return allPageItems.map(item => ({
          ...item,
          keyword_list: item.keyword_list?.filter(keyword => filters[selectedTabIndex.value]?.[keyword]) || []
        }))
      }
    }
    
    return allPageItems
  }

  const start = (currentPage.value - 1) * ITEMS_PER_PAGE
  const end = start + ITEMS_PER_PAGE
  
  let slicedItems = filteredItems.value.slice(start, end)
  
  if (isFilterableTab()) {
    const hasActiveFilters = filters[selectedTabIndex.value] && 
      Object.values(filters[selectedTabIndex.value]).some(active => active)
    
    if (hasActiveFilters) {
      slicedItems = slicedItems.map(item => ({
        ...item,
        keyword_list: item.keyword_list?.filter(keyword => filters[selectedTabIndex.value]?.[keyword]) || []
      }))
    }
  }

  return slicedItems
})

const getTabName = (tabIndex: number): string => {
  return TAB_NAMES[tabIndex as TabIndex] || 'main'
}

const isFilterableTab = (): boolean => {
  return FILTERABLE_TABS.includes(selectedTabIndex.value as any)
}

const truncateText = (text: string, maxLength: number): string => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const setSortOrder = (order: 'asc' | 'desc') => {
  sortOrder.value = order
  currentPage.value = 1
}

const toggleGrouping = () => {
  isGroupingEnabled.value = !isGroupingEnabled.value

  if (isGroupingEnabled.value) {
    Object.keys(groupedItems.value).forEach(domain => {
      expandedDomains[domain] = false
    })
  }
  
  currentPage.value = 1
}

const toggleDomainExpansion = (domain: string) => {
  expandedDomains[domain] = !expandedDomains[domain]
}

const resetFilters = () => {
  sortOrder.value = 'none'
  isGroupingEnabled.value = false
  currentPage.value = 1

  Object.keys(expandedDomains).forEach(domain => {
    delete expandedDomains[domain]
  })

  if (selectedTabIndex.value === 1 && originalItems.value.length) {
    const weights = originalItems.value
      .map(item => +(item.link_weight || 0))
      .filter(w => !isNaN(w) && isFinite(w))
    
    if (weights.length) {
      minRange.value = Math.min(...weights)
      maxRange.value = Math.max(...weights)
      startRangeValue.value = minRange.value
      endRangeValue.value = maxRange.value
    }
  }
}

const makeSafeForCSS = (name: string): string => {
  return name.replace(/[^a-z0-9]/g, (s) => {
    const c = s.charCodeAt(0)
    if (c === 32) return '-'
    if (c >= 65 && c <= 90) return '_' + s.toLowerCase()
    return '__' + ('000' + c.toString(16)).slice(-4)
  })
}

const decodePunycode = (input: string): string => {
  const base = 36
  const tMin = 1
  const tMax = 26
  const skew = 38
  const damp = 700
  const initialBias = 72
  const initialN = 128

  let n = initialN
  let i = 0
  let bias = initialBias
  let output: number[] = []

  const punycode = input.slice(4)

  let basic = punycode.lastIndexOf('-')
  if (basic < 0) basic = 0

  for (let j = 0; j < basic; ++j) {
    const charCode = punycode.charCodeAt(j)
    if (charCode >= 0x80) {
      return input
    }
    output.push(charCode)
  }

  for (let index = basic > 0 ? basic + 1 : 0; index < punycode.length; ) {
    const oldi = i
    let w = 1
    
    for (let k = base; ; k += base) {
      if (index >= punycode.length) {
        return input
      }
      
      const digit = punycode.charCodeAt(index++)
      let d: number
      
      if (digit >= 0x30 && digit <= 0x39) {
        d = digit - 0x30 + 26 // 0-9
      } else if (digit >= 0x41 && digit <= 0x5A) {
        d = digit - 0x41 // A-Z
      } else if (digit >= 0x61 && digit <= 0x7A) {
        d = digit - 0x61 // a-z
      } else {
        return input
      }
      
      i += d * w
      const t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias)
      
      if (d < t) break
      w *= (base - t)
    }
    
    const out = output.length + 1
    bias = adaptBias(i - oldi, out, oldi === 0)
    n += Math.floor(i / out)
    i %= out
    output.splice(i++, 0, n)
  }
  
  return String.fromCharCode(...output)
  
  function adaptBias(delta: number, numpoints: number, firsttime: boolean): number {
    delta = firsttime ? Math.floor(delta / damp) : delta >> 1
    delta += Math.floor(delta / numpoints)
    
    let k = 0
    while (delta > (((base - tMin) * tMax) >> 1)) {
      delta = Math.floor(delta / (base - tMin))
      k += base
    }
    
    return k + Math.floor(((base - tMin + 1) * delta) / (delta + skew))
  }
}

const getDomainName = (url: string): string => {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname

    if (hostname.includes('xn--')) {
      const parts = hostname.split('.')
      const decodedParts = parts.map(part => {
        if (part.startsWith('xn--')) {
          try {
            const decoded = decodePunycode(part)
            return decoded
          } catch {
            return part
          }
        }
        return part
      })
      
      return decodedParts.join('.')
    }
    
    return hostname
  } catch {
    try {
      const a = document.createElement('a')
      a.href = url
      const hostname = a.hostname

      if (hostname.includes('xn--')) {
        const parts = hostname.split('.')
        const decodedParts = parts.map(part => {
          if (part.startsWith('xn--')) {
            try {
              return decodePunycode(part)
            } catch {
              return part
            }
          }
          return part
        })
        return decodedParts.join('.')
      }
      
      return hostname
    } catch {
      return url
    }
  }
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

const selectTab = (newTabIndex: number): void => {
  if (selectedTabIndex.value === newTabIndex) return
  
  selectedTabIndex.value = newTabIndex
  currentPage.value = 1

  emit('filter-changed', {
    tab: newTabIndex,
    filters: filters[newTabIndex] || {}
  })
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

const updateList = (): void => {
}

const setPage = (page: number): void => {
  currentPage.value = page
}

const isInViewport = (el: Element | null): boolean => {
  if (!el) return false
  const rect = el.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

const checkAllItems = (): void => {
  Object.keys(tempLinkClasses).forEach(linkClassName => {
    const element = document.getElementById(linkClassName)
    if (element && isInViewport(element)) {
      const originalLink = tempLinkClasses[linkClassName]
      if (!seenLinks[originalLink]) {
        seenLinks[originalLink] = true

        emit('item-viewed', { link: originalLink, timestamp: Date.now() })
        
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

let intersectionObserver: IntersectionObserver | null = null

const setupIntersectionObserver = (): void => {
  if (intersectionObserver) {
    intersectionObserver.disconnect()
  }
  
  intersectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement
          const linkClassName = element.id
          const originalLink = tempLinkClasses[linkClassName]
          
          if (originalLink && !seenLinks[originalLink]) {
            seenLinks[originalLink] = true

            emit('item-viewed', { link: originalLink, timestamp: Date.now() })
            
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
    },
    {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    }
  )
}

onMounted(() => {
  const tabName = getTabName(selectedTabIndex.value)
  originalItems.value = [...(props.items[tabName as keyof typeof props.items] || [])]

  if (props.items.main?.length) {
    const weights = props.items.main
      .map(item => +(item.link_weight || 0))
      .filter(w => !isNaN(w) && isFinite(w))
    
    if (weights.length) {
      minRange.value = Math.min(...weights)
      maxRange.value = Math.max(...weights)
      startRangeValue.value = minRange.value
      endRangeValue.value = maxRange.value
    }
  }

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
  
  if (intersectionObserver) {
    intersectionObserver.disconnect()
  }
})

watch(renderedItems, () => {
  nextTick(() => {
    Object.keys(tempLinkClasses).forEach(key => {
      delete tempLinkClasses[key]
    })

    const itemsToTrack = isGroupingEnabled.value 
      ? Object.values(groupedItems.value).flat().filter((item) => {
          const domain = getDomainName(item.link)
          return expandedDomains[domain]
        })
      : renderedItems.value
    
    itemsToTrack.forEach(item => {
      const safeName = makeSafeForCSS(item.link)
      tempLinkClasses[safeName] = item.link
    })

    setupIntersectionObserver()

    setTimeout(() => {
      Object.keys(tempLinkClasses).forEach(linkClassName => {
        const element = document.getElementById(linkClassName)
        if (element && intersectionObserver) {
          intersectionObserver.observe(element)
        }
      })
    }, 100)

    checkAllItems()
  })
})

watch(expandedDomains, () => {
  if (isGroupingEnabled.value) {
    nextTick(() => {
      setupIntersectionObserver()

      setTimeout(() => {
        Object.keys(tempLinkClasses).forEach(linkClassName => {
          const element = document.getElementById(linkClassName)
          if (element && intersectionObserver) {
            intersectionObserver.observe(element)
          }
        })
      }, 100)
    })
  }
}, { deep: true })

watch(filteredItems, () => {
  const totalCount = isGroupingEnabled.value 
    ? Object.keys(allGroupedItems.value).length 
    : filteredItems.value.length
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1
  if (currentPage.value > totalPages) {
    currentPage.value = totalPages
  }
})

watch(isGroupingEnabled, () => {
  currentPage.value = 1
})

watch(() => props.filters, (newFilters) => {
  if (newFilters) {
    Object.assign(filters, newFilters)
  }
}, { deep: true })

watch(selectedTabIndex, (newTabIndex) => {
  const tabName = getTabName(newTabIndex)
  originalItems.value = [...(props.items[tabName as keyof typeof props.items] || [])]

  sortOrder.value = 'none'
  isGroupingEnabled.value = false
  Object.keys(expandedDomains).forEach(domain => {
    delete expandedDomains[domain]
  })
})
</script>

<style scoped>
@import url('https://fonts.cdnfonts.com/css/roboto');

* {
  box-sizing: border-box;
}

.number-report {
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

.flex-col {
  flex-direction: column;
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
  padding: 15px 8px 0;
  width: 50%;
}

@media (max-width: 570px) {
  .item-container {
    padding: 0 2px;
  }
  
  .filter-search-arbitrary {
    margin-left: 2px;
    width: 100%;
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

.account-exist {
  color: rgb(22, 144, 119);
}

.account-dont-exist {
  color: rgb(236, 94, 94);
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
  background: #9300ff;
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
  color: #9300ff;
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
  width: fit-content;
}

.empty-list svg {
  height: 18px;
  margin-right: 7px;
  fill: #8a6d3b;
}

.pagination-container {
  padding: 15px 8px 0;
  margin: auto;
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

.arbitrary-keys:not(.show) {
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

.arbitrary-key:not(:last-child) {
  margin-bottom: 8px;
}

.arbitrary-key input {
  margin: 2px 5px 0 0;
  height: 15px !important;
  width: 15px !important;
  line-height: 1 !important;
  accent-color: #9300FF;
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

.filter-info svg:not(:hover) + .filter-info_prompt {
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

.leaks {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  padding: 6px 6px 10px 6px;
  gap: 5px;
  background: #cdcdcd;
  margin: 0 3%;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0,0,0,.25);
  width: 100%;
}

.leaks .flex {
  gap: 6px 35px;
  padding: 0 5px;
}

.leak-description {
  padding: 6px 12px 7px 10px;
  font-size: 18px;
  background: white;
  border-radius: 4px 4px 0 0;
  margin: -6px -6px 10px;
}

.f-w-600 {
  font-weight: 600;
}

.leak {
  white-space: nowrap;
  height: 30px;
  display: flex;
  align-items: center;
  padding: 0 12px 0 10px;
  line-height: 1;
  background: white;
  border-radius: 5px;
}

table {
  background: #0000008c;
}

.gray-color {
  color: #ccc;
}

.m-b-5 {
  margin-bottom: 5px;
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
    box-shadow: inset 0 0 0 20px #4400ed;
  }
}

.td-key {
  letter-spacing: 1px;
  font-weight: 600;
  margin-right: 15px;
}

.td-result {
  color: #333;
}

.td-link {
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 400px;
}

.empty-result {
  color: #9d9d9d;
}

table table td img {
  padding: 0 5px 5px 0;
}

.tag-repeated-count {
  margin-left: auto;
  margin-right: -5px;
  background: #9300FF;
  color: white;
  padding: 2px 3px 2px 4px;
  border-radius: 4px;
  font-size: 13px;
  white-space: nowrap;
}

td {
  vertical-align: top;
}

td:first-child, th:first-child {
  border-right: 1px solid #ccc;
}

tr:last-child td {
  border-bottom: none;
}

table table tr td:first-child {
  border-right-color: #f3f3f3bb;
}

table table tr td {
  border-bottom-color: #f3f3f3bb;
}

td, th {
  background: white;
  padding: 8px 14px 7px 14px;
  border-bottom: 1px solid #ccc;
  height: 40px;
}

h2 {
  font-size: 22px;
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

@media (max-width: 670px) {
  .filter-search-arbitrary {
    width: 100%;
  }

  .wrap-reverse-container {
    flex-wrap: wrap-reverse;
  }
}

/* Sort and Filter Controls */
.controls-section {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.sort-controls {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.sort-btn, .group-btn, .reset-btn {
  padding: 6px 8px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  transition: all 0.2s;
  white-space: nowrap;
  min-width: fit-content;
}

.sort-btn:hover, .group-btn:hover, .reset-btn:hover {
  background: #f0f0f0;
  border-color: #bbb;
}

.sort-btn.active, .group-btn.active {
  background: #4400ed;
  color: white;
  border-color: #4400ed;
}

.reset-btn {
  background: #dc3545;
  color: white;
  border-color: #dc3545;
}

.reset-btn:hover {
  background: #c82333;
  border-color: #bd2130;
}

/* Domain Grouping Styles */
.domain-group {
  width: 100%;
  margin-bottom: 20px;
}

.domain-header {
  background: #f8f9fa;
  padding: 12px 16px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  transition: background-color 0.2s;
}

.domain-header:hover {
  background: #e9ecef;
}

.domain-toggle {
  font-size: 12px;
  color: #6c757d;
  width: 12px;
  text-align: center;
}

.domain-name {
  font-weight: 600;
  color: #495057;
  flex-grow: 1;
}

.domain-count {
  font-size: 12px;
  color: #6c757d;
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 3px;
}

.domain-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
}

.domain-items .item-container {
  margin-bottom: 15px;
}

@media (max-width: 768px) {
  .sort-controls {
    gap: 4px;
  }
  
  .sort-btn, .group-btn, .reset-btn {
    padding: 4px 6px;
    font-size: 10px;
  }
  
  .controls-section {
    margin-bottom: 10px;
  }
}
</style>