<script>
    import NavBar from './components/NavBar.vue';

    export default {
        components: {
            NavBar
        }
    }
</script>

<template>
    <NavBar />
    <main class="container">
        <RouterView />
    </main>
</template>

<style scoped></style>
