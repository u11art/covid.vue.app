<script>
    import covidApi from '../services/covid.api.js';
    import StatCard from '../components/StatCard.vue';

    export default {
        name: 'Dashboard',
        components: {
            StatCard
        },
        data() {
            return {
                loading: true,
                error: null,
                globalData: {},
                countriesData: [],
                historicalData: null,
                historicalChartData: null
            }
        },
        computed: {
            topCountries() {
                return this.countriesData.slice(0, 10)
            }
        },
        async mounted() {
            await this.loadData()
        },
        methods: {
            async loadData() {
                try {
                    this.loading = true
                    this.error = null

                    const [globalData, countriesData, historicalData] = await Promise.all([
                        covidApi.getGlobalData(),
                        covidApi.getCountriesData(),
                        covidApi.getHistoricalGlobal(30)
                    ])

                    this.globalData = globalData
                    this.countriesData = countriesData
                    this.historicalData = historicalData
                } catch (error) {
                    this.error = 'Ошибка при загрузке данных. Попробуйте обновить страницу.'
                    console.error('Ошибка при загрузке данных:', error)
                } finally {
                    this.loading = false
                }
            },
        }
    }
</script>
<template>
    <div class="dashboard">
        <div class="container">
            <div v-if="loading" class="loading">
                Загрузка данных...
            </div>
            
            <div v-else-if="error" class="error">
                {{ error }}
            </div>
      
            <div v-else>
                <div class="stats-grid">
                    <StatCard
                        title="Всего случаев"
                        :number="globalData.cases"
                        :change="globalData.todayCases"
                        type="confirmed"
                    />
                    <StatCard
                        title="Смертей"
                        :number="globalData.deaths"
                        :change="globalData.todayDeaths"
                        type="deaths"
                    />
                    <StatCard
                        title="Выздоровлений"
                        :number="globalData.recovered"
                        :change="globalData.todayRecovered"
                        type="recovered"
                    />
                    <StatCard
                        title="Активных случаев"
                        :number="globalData.active"
                        type="active"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
