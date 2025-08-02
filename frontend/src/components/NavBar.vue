<script setup>
    import { ref } from 'vue';

    import ThemeButton from './ThemeButton.vue';
    import { useIsMobile } from '../stores/mobile.js';

    const { isMobile } = useIsMobile();
    const menuOpen = ref(false);
</script>
<template>
    <header>
        <nav class="container">
            <div class="right">
                <RouterLink to="/"><h1>КовидСтат</h1></RouterLink>
                <template v-if="!isMobile">
                    <RouterLink to="/statistic">Статистика</RouterLink>
                    <RouterLink to="/map">Карта</RouterLink>
                </template>
            </div>
            <div class="left">
                <ThemeButton></ThemeButton>
                <template v-if="isMobile">
                    <div class="menu" :class="{ open: menuOpen }" @click="menuOpen = !menuOpen">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </template>
            </div>
        </nav>
        <aside v-if="menuOpen && isMobile">
            <section>
                <h3>Страницы</h3>
                <RouterLink to="/" active-class="active" @click="menuOpen = !menuOpen">Главная</RouterLink>
                <RouterLink to="/map" active-class="active" @click="menuOpen = !menuOpen">Карта</RouterLink>
            </section>
        </aside>
    </header>
    <div class="overlay" v-if="menuOpen && isMobile" @click="menuOpen = !menuOpen"></div>
</template>
<style scoped>
    header {
        background-color: var(--color-back);
        box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.2);
        position: sticky;
        top: 0;
        width: 100%;
        z-index: 21;
    }
    nav {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: baseline;

        padding: var(--padding);
        margin-left: auto;
        margin-right: auto;
    }
    div {
        display: flex;
        flex-direction: row;
        align-items: baseline;
        gap: var(--padding);
    }

    aside {
        background-color: var(--color-back);
        position: absolute;
        display: flex;
        flex-direction: column;
        gap: var(--spacing);
        padding: var(--padding);
        right: 0;
        height: 100vh;
        min-width: 250px;
        z-index: 20;
    }

    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.4);
        z-index: 19;
    }

    section {
        display: flex;
        flex-direction: column;
    }

    section a {
        text-decoration: none;
        padding: var(--padding);
        border-left: 3px solid transparent;
        transition: all 0.2s;
        font-size: 1rem;
    }

    section a:hover {
        border-left: 3px solid var(--color-text);
        background-color: var(--color-select);
    }

    section a.active {
        border-left: 3px solid var(--color-main);
        background-color: var(--color-select);
        color: var(--color-main);
    }
    
    a {
        font-size: 1rem;
        text-decoration: none;
        color: var(--color-link);
    }

    .menu {
        margin: auto;
        display: flex;
        place-items: center;
        height: 24px;
        width: 24px;
        cursor: pointer;
        overflow: hidden;
        position: relative;
    }
    .menu > span {
        position: absolute;
        width: 100%;
        height: 2px;
        background-color: var(--color-mono);
        transition:
            transform 0.3s ease,
            top 0.3s ease,
            opacity 0.3s ease
    }
    .menu > span:nth-child(1) {
        top: 2px;
    }
    .menu > span:nth-child(2) {
        top: 10px;
    }
    .menu > span:nth-child(3) {
        top: 18px;
    }
    .menu.open > span:nth-child(1) {
        transform: rotate(45deg);
        top: 10px;
    }
    .menu.open > span:nth-child(2) {
        opacity: 0;
    }
    .menu.open > span:nth-child(3) {
        transform: rotate(-45deg);
        top: 10px;
    }
</style>