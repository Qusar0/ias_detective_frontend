<template>
  <VNumberReport
      v-if="queryType === 'number'"
      :title="queryTitle"
      :items="numberItems"
  />
  <VCompanyReport
      v-if="queryType === 'company'"
      :title="queryTitle"
      :items="companyItems"
  />
  <VEmailReport
      v-if="queryType === 'email'"
      :title="queryTitle"
      :items="emailItems"
  />
  <VPersonReport
      v-if="queryType === 'person'"
      :minus-words="personData.minus"
      :translation-languages="personData.languages"
      :object-name="personData.objectName"
      :search-categories="personData.categories"
      :plus-words="personData.plus"
      :arbitrary-keywords="''"
      fullname-counters=""
      :items="personData.items"
  />
  <VIrbisReport
      v-if="queryType === 'irbis'"
      :query-id="query_id"
  />
</template>

<script>
import router from '../router/router.js';
import VNumberReport from '../components/Reports/VPhoneNumberReport.vue';
import VCompanyReport from '../components/Reports/VCompanyReport.vue';
import VEmailReport from '../components/Reports/VEmailReport.vue';
import VPersonReport from '../components/Reports/VPersonReport.vue';
import VIrbisReport from '../components/Reports/VIrbisReport.vue';

export default {
  components: {VIrbisReport, VPersonReport, VEmailReport, VCompanyReport, VNumberReport},
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
      companyItems: {
        all_materials: []
      },
      emailItems: {
        main: []
      },
      personData: {
        items: [],
        languages: []
      }
    };
  },
  async mounted() {
    this.query_id = this.$route.query.result_id;
    this.queryType = this.$route.query.query_type;
    this.queryTitle = this.$route.query.result_title;
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
      } else if (this.queryType === 'company') {
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
            size: 20
          })
        });
        let rawData = await res.json();

        this.translationLanguages = rawData.languages;
        this.companyItems.items.main = [];
        this.searchCategories = rawData.categories.map(item => {
          return item.name;
        });
      } else if (this.queryType === 'email') {
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
            size: 20
          })
        });
        let rawData = await res.json();

        this.emailItems.main = rawData;
      } else if (this.queryType === 'person') {
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
            size: 20
          })
        });
        let rawData = await res.json();

        this.personData.objectName = rawData.query_title;
        this.personData.categories = rawData.categories;
        this.personData.minus = rawData.minus_words;
        this.personData.plus = rawData.plus_words;
        this.personData.languages = rawData.languages.map(item => item.name);
        console.log(this.personData);
      } else if (this.queryType === 'irbis') {
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
            size: 20
          })
        });
        let rawData = await res.json();

        console.log(rawData)
      }
    } catch (error) {
      //await router.push('/')
    }
  }
};
</script>

<style scoped>

</style>