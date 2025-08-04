<script>
    export default {
        name: 'Footer'
    }
</script>
<template>
    <footer>
        <div class="container">
            <div class="grid">
                <section>
                    <h4>О проекте</h4>
                    <p>Это тестовый проект для демонстрации возможностей Vue.js</p>
                    <p>Проект не имеет коммерческих прав и лицензий</p>
                </section>
                
                <section>
                    <h4>Используемое API</h4>
                    <p>Данные получены из публичного API: <a href="https://disease.sh/" target="_blank">disease.sh</a></p>
                    <p>API используется исключительно в образовательных целях</p>
                </section>
            </div>
        
            <div class="bottom">
                <p>&copy; 2025 COVID-19 Dashboard. Ресурс не претендует на права.</p>
            </div>
        </div>
    </footer>
</template>
<style scoped>
    footer {
        background-color: var(--color-back);
        box-shadow: 0px -2px 4px 0px rgba(0, 0, 0, 0.2);
        position: sticky;
        margin-top: 1rem;
        width: 100%;
        z-index: 18;
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    }

    section {
        padding: 1rem;
    }


    .bottom {
        text-align: center;
        padding: 1rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

</style>
