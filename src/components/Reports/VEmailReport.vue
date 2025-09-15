<template>
  <div class="email-report" @click="closeModal">
    <!-- Tab Header -->
    <div class="tab-head" @click="closeModal">
      <div class="flex items-center" style="flex-wrap: wrap;">
        <h2 class="object-full_name">
          Почта: <span style="white-space:nowrap">{{ title }}</span>
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
      </div>
    </div>

    <!-- Controls Section -->
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

      <!-- Pagination -->
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
      <!-- Tab 1: Mentions -->
      <div :class="['tab-content-1', { selected: selectedTabIndex === 1 }]">
        <div v-if="!renderedItems.length" class="empty-list">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z" />
          </svg>
          Нет найденных результатов!
        </div>

        <!-- Grouped View -->
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

        <!-- Regular View -->
        <div 
          v-else
          v-for="item in renderedItems" 
          :key="item.link"
          :class="['item-container', { seen_link: seenLinks[item.link] }]"
          :id="makeSafeForCSS(item.link)"
        >
          <div class="item" style="position:relative">
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

    <!-- Bottom Pagination -->
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

// Types
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

// Props
const props = defineProps<{
  title: string
  items: {
    main?: Item[]
  }
  filters?: Record<number, FilterConfig>
}>()

// Emits
const emit = defineEmits<{
  'item-viewed': [payload: { link: string; timestamp: number }]
  'filter-changed': [payload: { tab: number; filters: FilterConfig }]
}>()

// Constants
const ITEMS_PER_PAGE = 20

// State management
const selectedTabIndex = ref(1)
const seenLinks = reactive<Record<string, boolean>>({})
const tempLinkClasses = reactive<Record<string, string>>({})

// Pagination state
const currentPage = ref(1)

// Filters state
const filters = reactive<Record<number, FilterConfig>>({ ...props.filters })

// Sorting and grouping state
const sortOrder = ref<'none' | 'asc' | 'desc'>('none')
const isGroupingEnabled = ref(false)
const expandedDomains = reactive<Record<string, boolean>>({})

// Store original order for reset
const originalItems = ref<Item[]>([])

// Check if current tab has items to show controls
const hasItemsForCurrentTab = computed(() => {
  return (props.items.main?.length || 0) > 0
})

// Cleanup function for scroll listener
let scrollCleanup: (() => void) | null = null

const filteredItems = computed((): Item[] => {
  let tempItems = [...(props.items.main || [])]

  // Apply sorting only when not grouping (grouping handles domain sorting separately)
  if (!isGroupingEnabled.value) {
    if (sortOrder.value === 'asc') {
      tempItems.sort((a, b) => a.link.localeCompare(b.link))
    } else if (sortOrder.value === 'desc') {
      tempItems.sort((a, b) => b.link.localeCompare(a.link))
    }
  }

  return tempItems
})

// Group ALL filtered items by domain (not just current page)
const allGroupedItems = computed(() => {
  if (!isGroupingEnabled.value) return {}
  
  const groups: Record<string, Item[]> = {}
  
  // Group ALL filtered items, not just current page
  filteredItems.value.forEach(item => {
    const domain = getDomainName(item.link)
    if (!groups[domain]) {
      groups[domain] = []
    }
    groups[domain].push(item)
  })
  
  // Sort domains based on current sort order
  const sortedGroups: Record<string, Item[]> = {}
  let domainKeys = Object.keys(groups)
  
  if (sortOrder.value === 'asc') {
    domainKeys = domainKeys.sort((a, b) => a.localeCompare(b))
  } else if (sortOrder.value === 'desc') {
    domainKeys = domainKeys.sort((a, b) => b.localeCompare(a))
  } else {
    // Default alphabetical sort when no specific order is set
    domainKeys = domainKeys.sort((a, b) => a.localeCompare(b))
  }
  
  domainKeys.forEach(domain => {
    sortedGroups[domain] = groups[domain]
  })
  
  return sortedGroups
})

// Get domains for current page (paginate domains, not items)
const paginatedDomains = computed(() => {
  if (!isGroupingEnabled.value) return []
  
  const domains = Object.keys(allGroupedItems.value)
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE
  const end = start + ITEMS_PER_PAGE
  
  return domains.slice(start, end)
})

// Get grouped items for current page domains only
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
  // If grouping is enabled, return all items from current page domains
  if (isGroupingEnabled.value) {
    const allPageItems: Item[] = []
    
    paginatedDomains.value.forEach(domain => {
      if (allGroupedItems.value[domain]) {
        allPageItems.push(...allGroupedItems.value[domain])
      }
    })
    
    return allPageItems
  }
  
  // Regular pagination for non-grouped view
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE
  const end = start + ITEMS_PER_PAGE
  
  return filteredItems.value.slice(start, end)
})

// Helper functions
const truncateText = (text: string, maxLength: number): string => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

// Sorting and grouping functions
const setSortOrder = (order: 'asc' | 'desc') => {
  sortOrder.value = order
  currentPage.value = 1
}

const toggleGrouping = () => {
  isGroupingEnabled.value = !isGroupingEnabled.value
  
  // If enabling grouping, collapse all domains by default
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
  
  // Clear expanded domains
  Object.keys(expandedDomains).forEach(domain => {
    delete expandedDomains[domain]
  })
}

// Utility functions
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

const copyToClipboard = async (text: string): Promise<void> => {
  try {
    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return
    }
    
    // Fallback to legacy method
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

// Tab management
const selectTab = (newTabIndex: number): void => {
  if (selectedTabIndex.value === newTabIndex) return
  
  selectedTabIndex.value = newTabIndex
  currentPage.value = 1
  
  // Emit filter change event
  emit('filter-changed', {
    tab: newTabIndex,
    filters: filters[newTabIndex] || {}
  })
}

const closeModal = (event?: Event): void => {
  event?.stopPropagation()
}

const updateList = (): void => {
  // Reactive computation handles filtering automatically
}

// Pagination handlers
const setPage = (page: number): void => {
  currentPage.value = page
}

// Viewport tracking
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
        // Mark as seen immediately when in viewport
        seenLinks[originalLink] = true
        
        // Emit event for parent component
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

// Enhanced viewport checking with intersection observer for better performance
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
            
            // Emit event for parent component
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

// Lifecycle hooks
onMounted(() => {
  // Store original items for reset functionality
  originalItems.value = [...(props.items.main || [])]

  // Set up scroll listener for tracking viewed items
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

// Watchers
watch(renderedItems, () => {
  nextTick(() => {
    // Clear previous tracking data
    Object.keys(tempLinkClasses).forEach(key => {
      delete tempLinkClasses[key]
    })
    
    // Update temp link classes for viewport tracking
    const itemsToTrack = isGroupingEnabled.value 
      ? Object.values(groupedItems.value).flat().filter((item) => {
          // Only track items in expanded domains
          const domain = getDomainName(item.link)
          return expandedDomains[domain]
        })
      : renderedItems.value
    
    itemsToTrack.forEach(item => {
      const safeName = makeSafeForCSS(item.link)
      tempLinkClasses[safeName] = item.link
    })
    
    // Setup intersection observer for better performance
    setupIntersectionObserver()
    
    // Observe all item elements
    setTimeout(() => {
      Object.keys(tempLinkClasses).forEach(linkClassName => {
        const element = document.getElementById(linkClassName)
        if (element && intersectionObserver) {
          intersectionObserver.observe(element)
        }
      })
    }, 100)
    
    // Fallback to original method
    checkAllItems()
  })
})

// Watch for domain expansion changes to update intersection observer
watch(expandedDomains, () => {
  if (isGroupingEnabled.value) {
    nextTick(() => {
      setupIntersectionObserver()
      
      // Re-observe elements in newly expanded domains
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

// Watch for grouping changes to reset pagination
watch(isGroupingEnabled, () => {
  currentPage.value = 1
})

// Watch for external filter changes
watch(() => props.filters, (newFilters) => {
  if (newFilters) {
    Object.assign(filters, newFilters)
  }
}, { deep: true })
</script>

<style scoped>
@import url('https://fonts.cdnfonts.com/css/roboto');

* {
  box-sizing: border-box;
}

.email-report {
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

@media (max-width: 570px) {
  .item-container {
    padding: 0 2px;
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