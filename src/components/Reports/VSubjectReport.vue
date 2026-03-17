<template>
  <div class="person-report" @click="closeModal">
    <div class="tab-head" @click="closeModal">
      <div class="head-info" :style="{ height: headInfoExpanded ? '105px' : '28px' }">
        <div class="head-info-top">
          <h2 class="object-full_name" @click="toggleHeadInfo">
            Объект: <span>{{ objectName }}</span>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                :style="{ transform: headInfoExpanded ? 'rotateX(180deg)' : 'rotateX(0deg)' }" viewBox="0 0 448 512"
            >
              <path
                  d="M201.4 342.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 274.7 86.6 137.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"
              />
            </svg>
          </h2>
          <div v-if="duplicatesRemoved > 0" class="duplicates-badge">
            Удалено дубликатов: {{ duplicatesRemoved }}
          </div>
        </div>
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
          <span class="tab-count">{{ keywordStats?.main || 0 }}</span>
        </div>
        <div
            :class="['tab-2', { selected: selectedTabIndex === 2 }]"
            @click="selectTab(2)"
        >
          Произвольные
          <span class="tab-count">{{ keywordStats?.['free word'] || 0 }}</span>
        </div>
        <div
            :class="['tab-3', { selected: selectedTabIndex === 3 }]"
            @click="selectTab(3)"
        >
          Негатив
          <span class="tab-count">{{ keywordStats?.negativ || 0 }}</span>
        </div>
        <div
            :class="['tab-4', { selected: selectedTabIndex === 4 }]"
            @click="selectTab(4)"
        >
          Репутация
          <span class="tab-count">{{ keywordStats?.reputation || 0 }}</span>
        </div>
        <div
            :class="['tab-5', { selected: selectedTabIndex === 5 }]"
            @click="selectTab(5)"
        >
          Связи
          <span class="tab-count">{{ keywordStats?.relations || 0 }}</span>
        </div>
        <div
            :class="['tab-6', { selected: selectedTabIndex === 6 }]"
            @click="selectTab(6)"
        >
          Соц.сети
          <span class="tab-count">{{ keywordStats?.socials || 0 }}</span>
        </div>
        <div
            :class="['tab-7', { selected: selectedTabIndex === 7 }]"
            @click="selectTab(7)"
        >
          Документы
          <span class="tab-count">{{ keywordStats?.documents || 0 }}</span>
        </div>
        <div
            :class="['tab-8', { selected: selectedTabIndex === 8 }]"
            @click="selectTab(8)"
        >
          Все материалы
          <span class="tab-count">{{ totalAllMaterials }}</span>
        </div>
      </div>
    </div>

    <div v-if="hasItemsForCurrentTab && !loadingTab && selectedTabIndex === 1" class="toggle-buttons-container">
      <button @click="chartExpanded = !chartExpanded" class="toggle-btn">
        <svg
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
            :style="{ transform: chartExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }"
        >
          <path
              d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"
          />
        </svg>
        <span>{{ chartExpanded ? 'Скрыть диаграмму' : 'Показать диаграмму' }}</span>
      </button>
    </div>

    <div v-if="selectedTabIndex === 1 && !loadingTab && chartExpanded" class="charts-section">
      <div class="results-chart-container">
        <h3 class="chart-title">Распределение результатов по вкладкам</h3>
        <div class="chart-notice">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path
                d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"
            />
          </svg>
          <span>
            Количество результатов на странице может отличаться от статистики из-за удаления дубликатов
          </span>
        </div>
        <div class="chart-stats">
          <div class="total-results">
            <div class="total-number">{{ totalAllMaterials }}</div>
            <div class="total-label">Всего результатов</div>
          </div>
          <div class="chart-bars">
            <div
                v-for="(item, index) in chartData"
                :key="index"
                class="chart-bar-item"
                @click="selectTab(item.tabIndex)"
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

    <div
        v-if="hasItemsForCurrentTab && !loadingTab"
        class="toggle-buttons-container"
    >
      <button @click="filtersExpanded = !filtersExpanded" class="toggle-btn">
        <svg
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
            :style="{ transform: filtersExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }"
        >
          <path
              d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"
          />
        </svg>
        <span>{{ filtersExpanded ? 'Скрыть фильтры' : 'Показать фильтры' }}</span>
      </button>
    </div>

    <div v-if="hasItemsForCurrentTab && !loadingTab && filtersExpanded" class="filters-container">
      <div class="fullname-filter-all-tabs">
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

      <div v-if="selectedTabIndex === 1" class="social-archives-filter-container">
        <label class="social-archives-filter">
          <input type="checkbox" v-model="hideSocialArchives" @change="updateFilters">
          <span>Скрыть архивы социальных сетей</span>
        </label>
      </div>

      <div v-if="availableKeywords.length > 0" class="keyword-filter-section">
        <div class="filter-title">Фильтр по ключевым словам:</div>
        <div class="keyword-search-input">
          <input
              v-model="keywordSearchQuery"
              placeholder="Поиск ключевых слов..."
              @input="filterKeywords"
          >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path
                d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"
            />
          </svg>
        </div>
        <div class="keyword-actions">
          <button @click="selectAllKeywords" class="keyword-action-btn">Выбрать все</button>
          <button @click="deselectAllKeywords" class="keyword-action-btn">Снять все</button>
        </div>
        <div class="keyword-list">
          <label
              v-for="keyword in filteredKeywordList"
              :key="keyword.word"
              class="keyword-item"
          >
            <input
                type="checkbox"
                :checked="selectedKeywords[keyword.word]"
                @change="toggleKeyword(keyword.word)"
            >
            <span class="keyword-text">{{ displayKeyword(keyword.word) }}</span>
            <span class="keyword-count">{{ keyword.count }}</span>
          </label>
        </div>
      </div>

      <div class="weight-filter-section">
        <div class="filter-label">
          Фильтр по весу источника:
          <span class="weight-tooltip">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16">
              <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/>
            </svg>
            <span class="weight-tooltip-text">
              <strong>Вес источника</strong> — это количество найденных ключевых слов в материале.<br><br>
              Чем больше ключевых слов содержит результат, тем выше его вес и релевантность вашему запросу.<br><br>
              Используйте фильтр для отбора наиболее релевантных материалов или для поиска результатов с конкретным количеством совпадений.
            </span>
          </span>
        </div>
        <div class="weight-info">
          <span>От {{ weightRange[0] }}</span>
          <span>До {{ weightRange[1] }}</span>
        </div>
        <div class="weight-slider-container">
          <div
              class="weight-slider-fill"
              :style="{
                left: ((weightRange[0] - minWeight) / (maxWeight - minWeight) * 100) + '%',
                width: ((weightRange[1] - weightRange[0]) / (maxWeight - minWeight) * 100) + '%'
              }"
          ></div>
          <input
              type="range"
              :min="minWeight"
              :max="maxWeight"
              v-model.number="weightRange[0]"
              @input="updateWeightFilter"
              class="weight-slider weight-slider-min"
          >
          <input
              type="range"
              :min="minWeight"
              :max="maxWeight"
              v-model.number="weightRange[1]"
              @input="updateWeightFilter"
              class="weight-slider weight-slider-max"
          >
        </div>
        <div class="weight-range-display">
          <span class="range-label">Диапазон:</span>
          <span class="range-values">{{ minWeight }} - {{ maxWeight }}</span>
        </div>
      </div>

      <div class="minus-keywords-section-all-tabs">
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
                <path
                    d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div class="reset-filters-container">
        <button @click="resetAllFilters" class="reset-filters-btn">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path
                d="M463.5 224H472c13.3 0 24-10.7 24-24V72c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2L413.4 96.6c-87.6-86.5-228.7-86.2-315.8 1c-87.5 87.5-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3c62.2-62.2 162.7-62.5 225.3-1L327 183c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8H463.5z"
            />
          </svg>
          <span>Сбросить все фильтры</span>
        </button>
      </div>
    </div>

    <div v-if="hasItemsForCurrentTab && !loadingTab" class="controls-section">
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
            v-if="isGroupingEnabled"
            @click="setSortOrder('count-asc')"
            :class="['sort-btn', { active: sortOrder === 'count-asc' }]"
            title="Сортировать по количеству результатов по возрастанию"
        >
          ↑ Кол-во (мало)
        </button>
        <button
            v-if="isGroupingEnabled"
            @click="setSortOrder('count-desc')"
            :class="['sort-btn', { active: sortOrder === 'count-desc' }]"
            title="Сортировать по количеству результатов по убыванию"
        >
          ↓ Кол-во (много)
        </button>
        <button
            v-if="!isGroupingEnabled"
            @click="setSortOrder('date-asc')"
            :class="['sort-btn', { active: sortOrder === 'date-asc' }]"
            title="Сортировать по дате по возрастанию"
        >
          ↑ Дата (старые)
        </button>
        <button
            v-if="!isGroupingEnabled"
            @click="setSortOrder('date-desc')"
            :class="['sort-btn', { active: sortOrder === 'date-desc' }]"
            title="Сортировать по дате по убыванию"
        >
          ↓ Дата (новые)
        </button>
        <button
            v-if="!isGroupingEnabled"
            @click="setSortOrder('weight-asc')"
            :class="['sort-btn', { active: sortOrder === 'weight-asc' }]"
            title="Сортировать по весу источника (количество ключевых слов) по возрастанию"
        >
          ↑ Вес (мало)
        </button>
        <button
            v-if="!isGroupingEnabled"
            @click="setSortOrder('weight-desc')"
            :class="['sort-btn', { active: sortOrder === 'weight-desc' }]"
            title="Сортировать по весу источника (количество ключевых слов) по убыванию"
        >
          ↓ Вес (много)
        </button>
        <button
            @click="toggleGrouping"
            :class="['group-btn', { active: isGroupingEnabled }]"
            title="Группировать по доменам"
        >
          📁 Группировка
        </button>
        <button
            @click="resetSortAndGrouping"
            class="reset-btn"
            title="Сбросить сортировку и группировку"
        >
          ↺ Сброс
        </button>
      </div>
    </div>

    <div v-if="hasItemsForCurrentTab && !loadingTab" class="pagination-container pagination-top">
      <VPagination
          :selected_page="currentPage"
          :general_count="isGroupingEnabled ? Object.keys(allGroupedItems).length : filteredItems.length"
          :set_selected_page="setPage"
          :updateList="updateList"
      />
    </div>

    <div class="content">
      <div
          v-for="tabIndex in [1, 2, 3, 4, 5, 6, 7, 8]"
          :key="tabIndex"
          :class="[`tab-content-${tabIndex}`, { selected: selectedTabIndex === tabIndex }]"
      >
        <div v-if="loadingTab && selectedTabIndex === tabIndex" class="loading-message">
          <div class="spinner"></div>
          <span>Загрузка данных...</span>
        </div>

        <div v-else-if="!filteredItems.length && selectedTabIndex === tabIndex" class="empty-list">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path
                d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"
            />
          </svg>
          Нет найденных результатов!
        </div>

        <template v-else-if="isGroupingEnabled && selectedTabIndex === tabIndex && filteredItems.length">
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
                <div class="item">
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

                  <span
                      v-if="item.publication_date" class="publication-date-top"
                  >
                    {{ item.publication_date }}
                  </span>

                  <div class="flex items-center">
                    <a :href="item.link" target="_blank" class="item-title" :title="item.title" @click="handleLinkClick(item.link)">
                      {{ item.title }}
                    </a>
                  </div>

                  <div class="item-content">{{ item.content }}</div>

                  <div class="item-info">
                    <a :href="item.link" target="_blank" :title="getDomainName(item.link)" @click="handleLinkClick(item.link)">
                      {{ truncateText(getDomainName(item.link), 20) }}
                    </a>

                    <div class="item-keywords" v-if="item.keyword_list?.length" style="margin-left:10px">
                      <div class="item-param">
                        <div class="query-content">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                            <path
                                d="M336 352c97.2 0 176-78.8 176-176S433.2 0 336 0S160 78.8 160 176c0 18.7 2.9 36.8 8.3 53.7L7 391c-4.5 4.5-7 10.6-7 17v80c0 13.3 10.7 24 24 24h80c13.3 0 24-10.7 24-24V448h40c13.3 0 24-10.7 24-24V384h40c6.4 0 12.5-2.5 17-7l33.3-33.3c16.9 5.4 35 8.3 53.7 8.3zM376 96a40 40 0 1 1 0 80 40 40 0 1 1 0-80z"
                            />
                          </svg>
                          <span class="keyword-counter">{{ item.keyword_list.length }}</span>
                          <template v-for="(query, index) in item.keyword_list" :key="index">
                            <span v-if="index > 0">, </span>
                            <span
                                class="query"
                                @click="copyToClipboard(String(query))"
                                :title="String(query)"
                            >
                              {{ displayKeyword(String(query)) }}
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
        </template>

        <template v-else-if="filteredItems.length && selectedTabIndex === tabIndex">
          <div
              v-for="item in renderedItems"
              :key="item.link"
              :class="['item-container', { seen_link: seenLinks[item.link] }]"
              :id="makeSafeForCSS(item.link)"
          >
            <div class="item">
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

              <span
                  v-if="item.publication_date" class="publication-date-top"
              >
                {{ item.publication_date }}
              </span>

              <div class="flex items-center">
                <a :href="item.link" target="_blank" class="item-title" :title="item.title" @click="handleLinkClick(item.link)">
                  {{ item.title }}
                </a>
              </div>

              <div class="item-content">{{ item.content }}</div>

              <div class="item-info">
                <a :href="item.link" target="_blank" :title="getDomainName(item.link)" @click="handleLinkClick(item.link)">
                  {{ truncateText(getDomainName(item.link), 20) }}
                </a>

                <div class="item-keywords" v-if="item.keyword_list?.length" style="margin-left:10px">
                  <div class="item-param">
                    <div class="query-content">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <path
                            d="M336 352c97.2 0 176-78.8 176-176S433.2 0 336 0S160 78.8 160 176c0 18.7 2.9 36.8 8.3 53.7L7 391c-4.5 4.5-7 10.6-7 17v80c0 13.3 10.7 24 24 24h80c13.3 0 24-10.7 24-24V448h40c13.3 0 24-10.7 24-24V384h40c6.4 0 12.5-2.5 17-7l33.3-33.3c16.9 5.4 35 8.3 53.7 8.3zM376 96a40 40 0 1 1 0 80 40 40 0 1 1 0-80z"
                        />
                      </svg>
                      <span class="keyword-counter">{{ item.keyword_list.length }}</span>
                      <template v-for="(query, index) in item.keyword_list" :key="index">
                        <span v-if="index > 0">, </span>
                        <span
                            class="query"
                            @click="copyToClipboard(String(query))"
                            :title="String(query)"
                        >
                          {{ displayKeyword(String(query)) }}
                        </span>
                      </template>
                      <small class="prompt">Копировать при клике</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <div v-if="hasItemsForCurrentTab && !loadingTab" class="pagination-container pagination-bottom">
      <VPagination
          :selected_page="currentPage"
          :general_count="isGroupingEnabled ? Object.keys(allGroupedItems).length : filteredItems.length"
          :set_selected_page="setPage"
          :updateList="updateList"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, nextTick, onMounted, reactive, ref, watch} from 'vue'
import VPagination from '../UI/VPagination.vue'

interface Item {
  link: string
  title: string
  content: string
  keyword_list?: string[]
  link_weight?: number | string
  is_fullname?: boolean
  publication_date?: string
  resource_type?: string
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
  keywordStats?: Record<string, number>
  queryId?: number | string
}>()

const emit = defineEmits<{
  'item-viewed': [payload: { link: string; timestamp: number }]
  'filter-changed': [payload: { tab: number; filters: any }]
}>()

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

const KEYWORD_TYPE_MAPPING: Record<number, string> = {
  1: 'main',
  2: 'free word',
  3: 'negativ',
  4: 'reputation',
  5: 'relations',
  6: 'socials',
  7: 'documents',
  8: 'all_materials'
}

const selectedTabIndex = ref(1)
const headInfoExpanded = ref(false)
const seenLinks = reactive<Record<string, boolean>>({})
const currentPage = ref(1)
const loadingTab = ref(false)
const loadedTabs = reactive<Record<number, boolean>>({})
const filtersExpanded = ref(false)
const chartExpanded = ref(false)

const fullnameFilter = ref<'all' | 'full' | 'partial'>('all')
const hideSocialArchives = ref(false)
const minusKeywords = ref<string[]>([])
const newMinusKeyword = ref('')

const sortOrder = ref<'none' | 'asc' | 'desc' | 'date-asc' | 'date-desc' | 'count-asc' | 'count-desc' | 'weight-asc' | 'weight-desc'>('none')
const secondarySortOrder = ref<'none' | 'date-asc' | 'date-desc'>('none')
const isGroupingEnabled = ref(false)
const expandedDomains = reactive<Record<string, boolean>>({})

const keywordSearchQuery = ref('')
const selectedKeywords = reactive<Record<string, boolean>>({})
const filteredKeywordList = ref<Array<{ word: string, count: number }>>([])

const minWeight = ref(0)
const maxWeight = ref(100)
const weightRange = ref<[number, number]>([0, 100])
const duplicatesRemoved = ref(0)

const availableKeywords = computed(() => {
  const tabItems = getTabItems(selectedTabIndex.value)
  const keywordCounts: Record<string, number> = {}

  tabItems.forEach(item => {
    if (item.keyword_list && item.keyword_list.length > 0) {
      item.keyword_list.forEach(keyword => {
        keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1
      })
    }
  })

  return Object.entries(keywordCounts)
      .map(([word, count]) => ({word, count}))
      .sort((a, b) => b.count - a.count)
})

const totalAllMaterials = computed(() => {
  return Object.values(props.keywordStats || {})
      .reduce((sum, count) => sum + (typeof count === 'number' ? count : 0), 0)
})

const chartData = computed(() => {
  const stats = props.keywordStats || {}
  const total = totalAllMaterials.value || 1

  const colors = [
    '#4400ed', // Главное
    '#9300FF', // Произвольные
    '#ef5350', // Негатив
    '#4caf50', // Репутация
    '#2196f3', // Связи
    '#ff9800', // Соц.сети
    '#795548', // Документы
    '#607d8b'  // Все материалы
  ]

  const labels = [
    'Главное',
    'Произвольные',
    'Негатив',
    'Репутация',
    'Связи',
    'Соц.сети',
    'Документы'
  ]

  const mapping = ['main', 'free word', 'negativ', 'reputation', 'relations', 'socials', 'documents']

  return mapping.map((key, index) => {
    const count = stats[key] || 0
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0
    return {
      label: labels[index],
      count,
      percentage,
      color: colors[index],
      tabIndex: index + 1
    }
  }).filter(item => item.count > 0)
})

const fullnameCounters = computed(() => {
  const tabItems = getTabItems(selectedTabIndex.value)

  return {
    all: tabItems.length,
    full: tabItems.filter((item: any) => item.is_fullname === true).length,
    partial: tabItems.filter((item: any) => item.is_fullname === false).length
  }
})

const hasItemsForCurrentTab = computed(() => {
  const tabItems = getTabItems(selectedTabIndex.value)
  return tabItems.length > 0
})

const getTabItems = (tabIndex: number): Item[] => {
  const tabName = TAB_NAMES[tabIndex as keyof typeof TAB_NAMES] || 'main'
  return props.items[tabName as keyof PersonItems] || []
}

const normalizeUrl = (url: string): string => {
  return url.replace(/^(https?:\/\/)?/, '').toLowerCase();
};

const filteredItems = computed((): Item[] => {
  let items = getTabItems(selectedTabIndex.value)

  // Фильтр по весу источника (вес = количество ключевых слов)
  items = items.filter(item => {
    const weight = item.keyword_list?.length || 0
    const minRange = Math.min(weightRange.value[0], weightRange.value[1])
    const maxRange = Math.max(weightRange.value[0], weightRange.value[1])
    return weight >= minRange && weight <= maxRange
  })

  if (fullnameFilter.value !== 'all') {
    items = items.filter((item: any) => {
      if (fullnameFilter.value === 'full') {
        return item.is_fullname === true
      } else if (fullnameFilter.value === 'partial') {
        return item.is_fullname === false
      }
      return true
    })
  }

  const activeKeywords = Object.entries(selectedKeywords)
      .filter(([_, isSelected]) => isSelected)
      .map(([keyword]) => keyword)

  if (activeKeywords.length > 0 && activeKeywords.length < availableKeywords.value.length) {
    items = items.filter(item => {
      if (!item.keyword_list || item.keyword_list.length === 0) return false
      return item.keyword_list.some(keyword => activeKeywords.includes(keyword))
    })
  }

  if (hideSocialArchives.value) {
    items = items.filter(item => !item.resource_type)
  }

  if (minusKeywords.value.length > 0) {
    items = items.filter(item => {
      const searchableContent = [
        item.title,
        item.content,
        item.link,
        ...(item.keyword_list || [])
      ].join(' ').toLowerCase()

      return !minusKeywords.value.some(keyword =>
          searchableContent.includes(keyword.toLowerCase())
      )
    })
  }

  if (!isGroupingEnabled.value) {
    if (sortOrder.value === 'asc' || sortOrder.value === 'desc') {
      items = [...items].sort((a, b) => {
        // Нормализуем ссылки для правильной сортировки
        const linkA = normalizeUrl(a.link);
        const linkB = normalizeUrl(b.link);

        return sortOrder.value === 'asc'
            ? linkA.localeCompare(linkB, 'ru', {sensitivity: 'base'})
            : linkB.localeCompare(linkA, 'ru', {sensitivity: 'base'});
      });
    } else if (sortOrder.value === 'date-asc' || sortOrder.value === 'date-desc') {
      items = [...items].sort((a, b) => {
        const dateA = a.publication_date ? parseDate(a.publication_date) : null
        const dateB = b.publication_date ? parseDate(b.publication_date) : null

        if (!dateA && !dateB) return 0
        if (!dateA) return 1
        if (!dateB) return -1

        const comparison = dateA.getTime() - dateB.getTime()
        return sortOrder.value === 'date-asc' ? comparison : -comparison
      })
    } else if (sortOrder.value === 'weight-asc' || sortOrder.value === 'weight-desc') {
      items = [...items].sort((a, b) => {
        const weightA = a.keyword_list?.length || 0
        const weightB = b.keyword_list?.length || 0

        const weightComparison = weightA - weightB
        return sortOrder.value === 'weight-asc' ? weightComparison : -weightComparison
      })
    }
  }

  // Удаление дубликатов по ссылке
  const beforeDedup = items.length
  const seenLinks = new Set<string>()
  items = items.filter(item => {
    if (seenLinks.has(item.link)) {
      return false
    }
    seenLinks.add(item.link)
    return true
  })

  duplicatesRemoved.value = beforeDedup - items.length

  return items
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
    domainKeys = domainKeys.sort((a, b) => {
      const normA = normalizeUrl(a);
      const normB = normalizeUrl(b);
      return normA.localeCompare(normB, 'ru', { sensitivity: 'base' });
    });
  } else if (sortOrder.value === 'desc') {
    domainKeys = domainKeys.sort((a, b) => {
      const normA = normalizeUrl(a);
      const normB = normalizeUrl(b);
      return normB.localeCompare(normA, 'ru', { sensitivity: 'base' });
    });
  } else if (sortOrder.value === 'count-asc') {
    domainKeys = domainKeys.sort((a, b) => groups[a].length - groups[b].length)
  } else if (sortOrder.value === 'count-desc') {
    domainKeys = domainKeys.sort((a, b) => groups[b].length - groups[a].length)
  } else {
    // Сортировка по умолчанию тоже с localeCompare
    domainKeys = domainKeys.sort((a, b) => {
      const normA = normalizeUrl(a);
      const normB = normalizeUrl(b);
      return normA.localeCompare(normB, 'ru', { sensitivity: 'base' });
    });
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

    return allPageItems
  }

  const start = (currentPage.value - 1) * ITEMS_PER_PAGE
  const end = start + ITEMS_PER_PAGE
  return filteredItems.value.slice(start, end)
})

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
  let n = 128
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

  for (let index = basic > 0 ? basic + 1 : 0; index < punycode.length;) {
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

const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null

  const monthMap: Record<string, number> = {
    'янв': 0, 'февр': 1, 'мар': 2, 'апр': 3, 'май': 4, 'мая': 4, 'июн': 5,
    'июл': 6, 'авг': 7, 'сен': 8, 'окт': 9, 'нояб': 10, 'дек': 11
  }

  const match = dateStr.match(/(\d+)\s+([а-я]+)\.?\s*(\d+)г?\.?/)
  if (!match) return null

  const day = parseInt(match[1])
  const monthStr = match[2].toLowerCase()
  const year = parseInt(match[3])

  const month = monthMap[monthStr]
  if (month === undefined) return null

  return new Date(year, month, day)
}

const truncateText = (text: string, maxLength: number): string => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const displayKeyword = (keyword: string): string => {
  return keyword === 'free word' ? 'ключевых слов нет' : keyword
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
  }
}

const toggleHeadInfo = (event: Event) => {
  event.stopPropagation()
  headInfoExpanded.value = !headInfoExpanded.value
}

const loadTabData = async (tabIndex: number) => {

  const keywordTypeCategory = KEYWORD_TYPE_MAPPING[tabIndex]

  if (tabIndex === 6) {
    if (loadedTabs[tabIndex]) {
      return
    }
  } else if (tabIndex === 7) {
    if (loadedTabs[tabIndex]) {
      return
    }
  } else if (tabIndex === 8) {
    if (loadedTabs[tabIndex]) {
      return
    }
  } else {
    if (!keywordTypeCategory) {
      return
    }
  }

  let requestKeywordTypeCategory: string | undefined = keywordTypeCategory

  if (tabIndex === 6) {
    requestKeywordTypeCategory = 'socials'
  } else if (tabIndex === 7) {
    requestKeywordTypeCategory = 'documents'
  } else if (tabIndex === 8) {
    requestKeywordTypeCategory = undefined
  }

  const statsCount = requestKeywordTypeCategory
    ? props.keywordStats?.[requestKeywordTypeCategory]
    : totalAllMaterials.value


  if (!statsCount || statsCount === 0) {
    loadedTabs[tabIndex] = true
    return
  }

  try {
    loadingTab.value = true

    const requestBody: any = {
      query_id: props.queryId,
      size: 20
    }

    if (requestKeywordTypeCategory) {
      requestBody.keyword_type_category = requestKeywordTypeCategory
    }

    const categoryRes = await fetch('/api/queries/category_query_data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(requestBody)
    })
    const categoryData = await categoryRes.json()

    const totalResults = categoryData.total || (categoryData.size * categoryData.total_pages) || 0

    if (totalResults > 0) {
      const dataRequestBody: any = {
        query_id: props.queryId,
        page: 1,
        size: totalResults
      }

      if (requestKeywordTypeCategory) {
        dataRequestBody.keyword_type_category = requestKeywordTypeCategory
      }

      const dataRes = await fetch('/api/queries/query_data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(dataRequestBody)
      })
      const data = await dataRes.json()

      const items = data.map(({title, info, url, publication_date, keywords, is_fullname, resource_type}: any) => ({
        title: title,
        link: url,
        content: info,
        publication_date: publication_date,
        keyword_list: keywords || [],
        is_fullname: is_fullname,
        resource_type: resource_type
      }))

      const tabName = TAB_NAMES[tabIndex as keyof typeof TAB_NAMES]
      if (props.items[tabName]) {
        props.items[tabName] = items
      }

      loadedTabs[tabIndex] = true
    }
  } catch (error) {
    console.error(`Error loading tab ${tabIndex}:`, error)
  } finally {
    loadingTab.value = false
  }
}

const selectTab = async (newTabIndex: number): Promise<void> => {
  if (selectedTabIndex.value === newTabIndex) return

  selectedTabIndex.value = newTabIndex
  currentPage.value = 1

  await loadTabData(newTabIndex)

  await nextTick()
  initializeKeywordFilter()
  updateWeightRange()

  emit('filter-changed', {
    tab: newTabIndex,
    filters: {}
  })
}

const initializeKeywordFilter = () => {
  Object.keys(selectedKeywords).forEach(key => {
    delete selectedKeywords[key]
  })

  availableKeywords.value.forEach(({word}) => {
    selectedKeywords[word] = true
  })

  filteredKeywordList.value = [...availableKeywords.value]
  keywordSearchQuery.value = ''
}

const updateWeightRange = () => {
  const tabItems = getTabItems(selectedTabIndex.value)

  if (tabItems.length === 0) {
    minWeight.value = 0
    maxWeight.value = 100
    weightRange.value = [0, 100]
    return
  }

  const weights = tabItems.map(item => item.keyword_list?.length || 0)

  minWeight.value = Math.min(...weights, 0)
  maxWeight.value = Math.max(...weights, 1)
  weightRange.value = [minWeight.value, maxWeight.value]
}

const updateWeightFilter = () => {
  if (weightRange.value[0] > weightRange.value[1]) {
    const temp = weightRange.value[0]
    weightRange.value[0] = weightRange.value[1]
    weightRange.value[1] = temp
  }

  currentPage.value = 1
}

const resetAllFilters = () => {
  fullnameFilter.value = 'all'

  hideSocialArchives.value = false

  Object.keys(selectedKeywords).forEach(key => {
    selectedKeywords[key] = false
  })

  minusKeywords.value = []
  newMinusKeyword.value = ''

  updateWeightRange()

  currentPage.value = 1
}

const filterKeywords = () => {
  const query = keywordSearchQuery.value.toLowerCase()
  if (!query) {
    filteredKeywordList.value = [...availableKeywords.value]
  } else {
    filteredKeywordList.value = availableKeywords.value.filter(({word}) =>
        word.toLowerCase().includes(query)
    )
  }
}

const toggleKeyword = (keyword: string) => {
  selectedKeywords[keyword] = !selectedKeywords[keyword]
  currentPage.value = 1
}

const selectAllKeywords = () => {
  filteredKeywordList.value.forEach(({word}) => {
    selectedKeywords[word] = true
  })
  currentPage.value = 1
}

const deselectAllKeywords = () => {
  filteredKeywordList.value.forEach(({word}) => {
    selectedKeywords[word] = false
  })
  currentPage.value = 1
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

}

const setSortOrder = (order: 'asc' | 'desc' | 'date-asc' | 'date-desc' | 'weight-asc' | 'weight-desc' | 'count-asc' | 'count-desc') => {
  sortOrder.value = sortOrder.value === order ? 'none' : order;
  currentPage.value = 1;
}

const toggleGrouping = () => {
  isGroupingEnabled.value = !isGroupingEnabled.value;

  if (isGroupingEnabled.value) {
    if (sortOrder.value === 'weight-asc' || sortOrder.value === 'weight-desc' ||
        sortOrder.value === 'date-asc' || sortOrder.value === 'date-desc' ||
        sortOrder.value === 'none') {
      sortOrder.value = 'count-desc';
    }

    Object.keys(groupedItems.value).forEach(domain => {
      expandedDomains[domain] = false;
    });
  }

  currentPage.value = 1;
}

const resetSortAndGrouping = () => {
  sortOrder.value = 'none';
  isGroupingEnabled.value = false;
  currentPage.value = 1;

  Object.keys(expandedDomains).forEach(domain => {
    delete expandedDomains[domain];
  });
}

const toggleDomainExpansion = (domain: string) => {
  expandedDomains[domain] = !expandedDomains[domain]
}

const handleLinkClick = (link: string) => {
  if (!seenLinks[link]) {
    seenLinks[link] = true
    emit('item-viewed', {link: link, timestamp: Date.now()})

    nextTick(() => {
      const element = document.getElementById(makeSafeForCSS(link))
      if (element) {
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
}

onMounted(async () => {
  await nextTick()

  if (props.keywordStats && Object.keys(props.keywordStats).length > 0) {
    await loadTabData(1)
    await nextTick()
    initializeKeywordFilter()
  } else {
  }
})

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

watch(availableKeywords, () => {
  initializeKeywordFilter()
})

watch(() => props.keywordStats, async (newStats, oldStats) => {

  if (newStats && Object.keys(newStats).length > 0 && !loadedTabs[1]) {
    await loadTabData(1)
    await nextTick()
    initializeKeywordFilter()
  }
}, {immediate: false, deep: true})
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
  box-shadow: 0 3px 4px rgb(184, 183, 183);
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

.head-info-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 5px;
}

.duplicates-badge {
  background: #d9edf7;
  color: #31708f;
  border: 1px solid #bce8f1;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  font-weight: 500;
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
  font-size: 14px;
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

.social-archives-filter-container {
  margin: 0 10px 10px;
  padding: 12px;
  background: white;
  border-radius: 5px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
}

.social-archives-filter {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.social-archives-filter input {
  margin-right: 8px;
  cursor: pointer;
  width: 16px;
  height: 16px;
  accent-color: #4400ed;
}

.social-archives-filter span {
  font-size: 14px;
  font-weight: 500;
}

/* Results Chart */
.results-chart-container {
  width: 100%;
  max-width: 800px;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px 0;
  text-align: center;
  color: #333;
}

.chart-notice {
  color: #31708f;
  background: #d9edf7;
  border: 1px solid #bce8f1;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 4px;
  margin: 0 0 15px 0;
  font-size: 13px;
}

.chart-notice svg {
  height: 16px;
  min-width: 16px;
  margin-right: 8px;
  fill: #31708f;
}

.chart-notice span {
  line-height: 1.4;
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
  grid-template-columns: 120px 1fr 60px;
  align-items: center;
  gap: 12px;
  cursor: pointer;
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
    grid-template-columns: 90px 1fr 50px;
    gap: 8px;
  }

  .bar-label {
    font-size: 11px;
  }

  .total-number {
    font-size: 28px;
  }
}

.minus-keywords-section-all-tabs {
  margin: 0 10px 10px;
  padding: 12px;
  background: white;
  border-radius: 5px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
}

.minus-keywords-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-label {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 5px;
}

.minus-keywords-input {
  display: flex;
  gap: 8px;
}

.minus-keywords-input input {
  flex: 1;
  height: 32px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0 10px;
  outline: none;
  font-size: 14px;
}

.minus-keywords-input input:focus {
  border-color: #4400ed;
}

.minus-keywords-input button {
  height: 32px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0 15px;
  background: #f0f0f0;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
  white-space: nowrap;
}

.minus-keywords-input button:hover {
  background: #e0e0e0;
  border-color: #bbb;
}

.minus-keywords-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.minus-keyword {
  display: flex;
  align-items: center;
  padding: 5px 8px 5px 10px;
  font-size: 14px;
  background: #ffebee;
  border: 1px solid #ef5350;
  border-radius: 4px;
  cursor: default;
}

.minus-keyword span {
  white-space: nowrap;
  user-select: none;
  color: #c62828;
  font-weight: 500;
}

.minus-keyword svg {
  margin-left: 6px;
  width: 14px;
  height: 14px;
  cursor: pointer;
  fill: #ef5350;
  transition: fill 0.2s;
}

.minus-keyword svg:hover {
  fill: #d32f2f;
}

.content {
  padding: 15px 8px 0;
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
  position: relative;
}

.publication-date-top {
  position: absolute;
  top: 12px;
  right: 15px;
  color: #666;
  font-size: 11px;
  background: #f5f5f5;
  padding: 3px 8px;
  border-radius: 3px;
  white-space: nowrap;
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
  padding-right: 100px;
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
  margin-left: 10px;
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

.keyword-counter {
  font-size: 11px;
  font-weight: 600;
  margin-left: 2px;
  white-space: nowrap;
  color: #9300ff;
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

.loading-message {
  color: #31708f;
  background: #d9edf7;
  border: 1px solid #bce8f1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 50px;
  padding: 0 20px;
  border-radius: 4px;
  margin: 15px auto;
  width: fit-content;
  min-width: 220px;
  font-weight: 500;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(49, 112, 143, 0.3);
  border-top-color: #31708f;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.pagination-container {
  padding: 15px 8px 0;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  width: 100%;
}

.pagination-top {
  padding-top: 10px;
  padding-bottom: 0;
}

.pagination-bottom {
  padding-top: 15px;
  padding-bottom: 15px;
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

/* Sort and Filter Controls */
.controls-section {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0 10px;
  margin-top: 15px;
}

.sort-controls {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
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

.sort-btn.secondary {
  background: #8866ff;
  color: white;
  border-color: #8866ff;
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
    margin-top: 10px;
  }
}

/* Fullname Filter for All Tabs */
/* Toggle Buttons Container */
.toggle-buttons-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 15px 10px 0;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 15px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
}

.toggle-btn:hover {
  background: #f5f5f5;
  border-color: #4400ed;
}

.toggle-btn svg {
  width: 14px;
  height: 14px;
  fill: #666;
  transition: transform 0.3s;
}

.reset-filters-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 15px;
  background: #4400ed;
  color: white;
  border: 1px solid #4400ed;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
}

.reset-filters-btn:hover {
  background: #3300cc;
  border-color: #3300cc;
}

.reset-filters-btn svg {
  width: 14px;
  height: 14px;
  fill: white;
}

.reset-filters-container {
  margin-top: 15px;
  display: flex;
  justify-content: center;
}

.filters-container {
  margin-top: 10px;
}

.fullname-filter-all-tabs {
  display: flex;
  align-items: center;
  height: 34px;
  font-size: 14px;
  background: white;
  padding: 0 10px;
  border-radius: 5px;
  white-space: nowrap;
  margin: 0 10px 10px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
}

.fullname-filter-all-tabs .filter-title {
  font-size: 16px;
  margin-right: 10px;
  font-weight: 600;
}

.fullname-filter-all-tabs label {
  display: flex;
  align-items: center;
  margin-left: 20px;
  cursor: pointer;
}

.fullname-filter-all-tabs label input {
  margin-right: 5px;
  cursor: pointer;
  accent-color: #4400ed;
}

.fullname-filter-all-tabs label span {
  margin-left: 5px;
  background: #4400ed;
  color: white;
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 11px;
}

/* Keyword Filter Section */
.keyword-filter-section {
  margin: 0 10px 10px;
  padding: 12px;
  background: white;
  border-radius: 5px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
}

.keyword-filter-section .filter-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
}

.keyword-search-input {
  position: relative;
  margin-bottom: 10px;
}

.keyword-search-input input {
  width: 100%;
  height: 32px;
  padding: 0 35px 0 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
  font-size: 14px;
}

.keyword-search-input input:focus {
  border-color: #4400ed;
}

.keyword-search-input svg {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  fill: #999;
  pointer-events: none;
}

.keyword-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.keyword-action-btn {
  padding: 5px 12px;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.keyword-action-btn:hover {
  background: #e0e0e0;
  border-color: #bbb;
}

.keyword-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
}

.keyword-list::-webkit-scrollbar {
  width: 8px;
}

.keyword-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.keyword-list::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.keyword-list::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.keyword-item {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  cursor: pointer;
  border-radius: 3px;
  transition: background 0.2s;
}

.keyword-item:hover {
  background: #f5f5f5;
}

.keyword-item input[type="checkbox"] {
  margin-right: 8px;
  cursor: pointer;
  width: 16px;
  height: 16px;
  accent-color: #4400ed;
}

.keyword-text {
  flex: 1;
  font-size: 14px;
}

.keyword-count {
  margin-left: 8px;
  background: #4400ed;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 600;
}

@media (max-width: 640px) {
  .fullname-filter-all-tabs {
    flex-wrap: wrap;
    height: auto;
    padding: 10px;
  }

  .fullname-filter-all-tabs label {
    margin-left: 10px;
    margin-top: 5px;
  }

  .keyword-filter-section {
    margin: 10px 5px 0;
    padding: 10px;
  }
}

/* Weight Filter Section */
.weight-filter-section {
  margin: 0 10px 10px;
  padding: 12px;
  background: white;
  border-radius: 5px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
}

.weight-tooltip {
  position: relative;
  display: inline-flex;
  align-items: center;
  margin-left: 6px;
  cursor: help;
  vertical-align: middle;
}

.weight-tooltip svg {
  fill: #666;
  transition: fill 0.2s;
}

.weight-tooltip:hover svg {
  fill: #4400ed;
}

.weight-tooltip-text {
  visibility: hidden;
  opacity: 0;
  position: absolute;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  width: 320px;
  background-color: #333;
  color: white;
  text-align: left;
  padding: 12px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.5;
  z-index: 1000;
  transition: opacity 0.3s, visibility 0.3s;
  pointer-events: none;
}

.weight-tooltip-text::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 6px;
  border-style: solid;
  border-color: #333 transparent transparent transparent;
}

.weight-tooltip:hover .weight-tooltip-text {
  visibility: visible;
  opacity: 1;
}

.weight-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.weight-slider-container {
  position: relative;
  height: 40px;
  margin-bottom: 10px;
}

.weight-slider-container::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 6px;
  background: #ddd;
  border-radius: 3px;
  transform: translateY(-50%);
  z-index: 0;
}

.weight-slider-fill {
  position: absolute;
  top: 50%;
  height: 6px;
  background: #4400ed;
  border-radius: 3px;
  transform: translateY(-50%);
  z-index: 1;
  transition: left 0.1s, width 0.1s;
}

.weight-slider {
  position: absolute;
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  outline: none;
  pointer-events: none;
  top: 50%;
  transform: translateY(-50%);
}

.weight-slider::-webkit-slider-track {
  width: 100%;
  height: 6px;
  background: transparent;
  border-radius: 3px;
}

.weight-slider::-moz-range-track {
  width: 100%;
  height: 6px;
  background: transparent;
  border-radius: 3px;
}

.weight-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  background: #4400ed;
  cursor: pointer;
  border-radius: 50%;
  pointer-events: all;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.weight-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: #4400ed;
  cursor: pointer;
  border-radius: 50%;
  pointer-events: all;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.weight-slider-min {
  z-index: 1;
}

.weight-slider-max {
  z-index: 2;
}

.weight-slider::-webkit-slider-thumb:hover {
  background: #3300cc;
}

.weight-slider::-moz-range-thumb:hover {
  background: #3300cc;
}

.weight-range-display {
  display: flex;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  color: #666;
}

.range-label {
  font-weight: 600;
}

.range-values {
  color: #4400ed;
  font-weight: 600;
}
</style>