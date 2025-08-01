import axios from 'axios'

const BASE_URL = 'https://disease.sh/v3/covid-19'

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 25000
})

export default {
    /* Получить глобальную статистику */
    async getGlobalData() {
        try {
            const response = await api.get('/all')
            return response.data
        } catch (error) {
            console.error('Error fetching global data:', error)
            throw error
        }
    },

    /* Получить данные по всем странам */
    async getCountriesData() {
        try {
            const response = await api.get('/countries?sort=cases')
            return response.data
        } catch (error) {
            console.error('Error fetching countries data:', error)
            throw error
        }
    },

    /* Получить данные по конкретной стране */
    async getCountryData(country) {
        try {
            const response = await api.get(`/countries/${country}`)
            return response.data
        } catch (error) {
            console.error(`Error fetching data for ${country}:`, error)
            throw error
        }
    },

    /* Получить исторические данные по всему миру */
    async getHistoricalGlobal(days = 30) {
        try {
            const response = await api.get(`/historical/all?lastdays=${days}`)
            return response.data
        } catch (error) {
            console.error('Error fetching historical global data:', error)
            throw error
        }
    },

    /* Получить исторические данные по стране */
    async getHistoricalCountry(country, days = 30) {
        try {
            const response = await api.get(`/historical/${country}?lastdays=${days}`)
            return response.data
        } catch (error) {
            console.error(`Error fetching historical data for ${country}:`, error)
            throw error
        }
    },

    /* Получить данные по континентам */
    async getContinentsData() {
        try {
            const response = await api.get('/continents?sort=cases')
            return response.data
        } catch (error) {
            console.error('Error fetching continents data:', error)
            throw error
        }
    },

    /* Получить вакцинационные данные */
    async getVaccineData() {
        try {
            const response = await api.get('/vaccine/coverage/countries?lastdays=1')
            return response.data
        } catch (error) {
            console.error('Error fetching vaccine data:', error)
            throw error
        }
    }
}
