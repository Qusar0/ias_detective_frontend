<template>
  <VNumberReport
      v-if="queryType === 'number'"
      :title="queryTitle"
      :items="numberItems"
  />
  <VSubjectReport
      v-if="queryType === 'company' || queryType === 'person'"
      :minus-words="subjectData.minus.join(', ')"
      :translation-languages="subjectData.languages"
      :object-name="subjectData.objectName"
      :search-categories="subjectData.categories.join(', ')"
      :plus-words="subjectData.plus.join(', ')"
      :arbitrary-keywords="subjectData.freeWords.join(', ')"
      :keyword-stats="subjectData.keywordStats"
      :query-id="query_id"
      fullname-counters=""
      :items="subjectData.items"
  />
  <VEmailReport
      v-if="queryType === 'email'"
      :title="queryTitle"
      :items="emailItems"
  />
  <VIrbisReport
      v-if="queryType === 'irbis'"
      :query-id="query_id"
  />
</template>

<script>
import router from '../router/router.js';
import VNumberReport from '../components/Reports/VPhoneNumberReport.vue';
import VSubjectReport from '../components/Reports/VSubjectReport.vue';
import VEmailReport from '../components/Reports/VEmailReport.vue';
import VIrbisReport from '../components/Reports/VIrbisReport.vue';

export default {
  components: {VIrbisReport, VSubjectReport, VEmailReport, VNumberReport},
  methods: {
    router() {
      return router;
    }
  },
  data() {
    return {
      query_id: null,
      queryType: '',
      queryTitle: '',
      numberItems: {
        main: [],
        arbitrary: []
      },
      emailItems: {
        main: []
      },
      subjectData: {
        objectName: '',
        categories: [],
        minus: [],
        plus: [],
        languages: [],
        keywordStats: {},
        freeWords: [],
        items: {
          main: [],
          arbitrary: [],
          negative: [],
          reputation: [],
          connections: [],
          socials: [],
          documents: [],
          all_materials: []
        }
      }
    };
  },
  async mounted() {
    this.query_id = this.$route.query.result_id;
    this.queryType = this.$route.query.query_type;
    this.queryTitle = this.$route.query.result_title;

    if (!this.query_id || !this.queryType || (this.queryType && this.queryType !== 'irbis' && !this.queryTitle)) {
      await router.push('/')
    }

    try {
      if (this.queryType === 'number') {
        this.queryTitle = `+${this.queryTitle.split(' ').join('')}`;

        // Сначала получаем информацию о количестве результатов
        const categoryRes = await fetch(`/api/queries/category_query_data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            query_id: this.query_id,
            keyword_type_category: 'free word',
            size: 20
          })
        });
        const categoryData = await categoryRes.json();

        // Вычисляем общее количество результатов
        const totalResults = categoryData.total || (categoryData.size * categoryData.total_pages) || 0;

        // Получаем все результаты одним запросом
        const res = await fetch(`/api/queries/query_data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            query_id: this.query_id,
            keyword_type_category: 'free word',
            page: 1,
            size: totalResults
          })
        });
        let rawData = await res.json();

        this.numberItems.main = rawData
            .map(({title, info, url, publication_date, keywords}) => {
              return {
                title: title,
                link: url,
                content: info,
                publication_date: publication_date,
                keyword_list: [this.queryTitle]
              };
            });
      } else if (this.queryType === 'company' || this.queryType === 'person') {
        // Получаем общую информацию о запросе
        const generalRes = await fetch(`/api/queries/general_query_data?query_id=${this.query_id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        let generalData = await generalRes.json();

        this.subjectData.objectName = generalData.query_title;
        this.subjectData.categories = generalData.categories.map(item => item.name);
        this.subjectData.minus = generalData.minus_words || [];
        this.subjectData.plus = generalData.plus_words || [];
        this.subjectData.languages = generalData.languages.map(item => item.name);
        this.subjectData.keywordStats = generalData.keyword_stats || {};
        this.subjectData.freeWords = generalData.free_words || [];

        // Инициализируем items для всех вкладок (пустые, данные загрузятся при переключении)
        this.subjectData.items = {
          main: [],
          arbitrary: [],
          negative: [],
          reputation: [],
          connections: [],
          socials: [],
          documents: [],
          all_materials: []
        };

        console.log(this.subjectData);
      } else if (this.queryType === 'email') {
        // Сначала получаем информацию о количестве результатов
        const categoryRes = await fetch(`/api/queries/category_query_data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            query_id: this.query_id,
            keyword_type_category: 'free word',
            size: 20
          })
        });
        const categoryData = await categoryRes.json();

        // Вычисляем общее количество результатов
        const totalResults = categoryData.total || (categoryData.size * categoryData.total_pages) || 0;

        // Получаем все результаты одним запросом
        const res = await fetch(`/api/queries/query_data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            query_id: this.query_id,
            keyword_type_category: 'free word',
            page: 1,
            size: totalResults
          })
        });
        let rawData = await res.json();

        this.emailItems.main = rawData
            .map(({title, info, url, publication_date, keywords}) => {
              return {
                title: title,
                link: url,
                content: info,
                publication_date: publication_date,
                keyword_list: [this.queryTitle]
              };
            });
      } else if (this.queryType === 'irbis') {
        // может тут что-то тоже появится для пагинации
      }
    } catch (error) {
      await router.push('/')
    }
  }
};
</script>

<style scoped>

</style>