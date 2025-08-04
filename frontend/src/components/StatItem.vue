<script>
    export default {
        name: 'StatItem',
        props: {
            country: {
                type: Object,
                required: true
            },
            index: {
                type: Number,
                required: true
            }
        }
    }
</script>
<template>
    <div class="item">
        <div class="rank">{{ index + 1 }}</div>
        <img :src="country.countryInfo.flag" :alt="country.country" class="flag" />
        <div class="info">
            <div >{{ country.country }}</div>
            <div >{{ country.cases.toLocaleString('ru-RU') }} случаев</div>
        </div>
        <div class="stats">
            <div class="stat-item">
                <span >Смерти:</span>
                <span class="deaths">{{ country.deaths.toLocaleString('ru-RU') }}</span>
            </div>
            <div class="stat-item">
                <span >Выздоровления:</span>
                <span class="recovered">{{ country.recovered.toLocaleString('ru-RU') }}</span>
            </div>
        </div>
    </div>
</template>


<style scoped>
    .item {
        display: grid;
        grid-template-columns: auto auto 1fr auto;
        gap: 0.25rem;
        align-items: center;
        padding: 0.5rem;
        background-color: var(--color-select);
        border-bottom: solid 2px var(--color-main);
        overflow: hidden;
        word-break: break-word;
        max-width: 100%;
    }

    .rank {
        font-weight: 700;
        min-width: 30px;
        text-align: center;
    }

    .flag {
        width: 25px;
        height: 18px;
        border-radius: 2px;
        object-fit: cover;
    }

    .info {
        display: flex;
        flex-direction: column;
        min-width: 0;
        overflow: hidden;
    }

    .stats {
        display: flex;
        flex-direction: column;
        text-align: right;
        max-width: 120px;
        word-break: break-word;
    }

    .stat-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
    }

    .deaths {
        color: #e74c3c;
    }

    .recovered {
        color: #27ae60;
    }
</style>
