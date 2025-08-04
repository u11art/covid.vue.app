<script>
    import NavBar from './components/NavBar.vue';
    import Footer from './components/Footer.vue';

    export default {
        components: {
            NavBar,
            Footer
        }
    }
</script>

<template>
    <NavBar />
    <main class="container">
        <RouterView />
    </main>
    <Footer />
</template>

<style scoped></style>
