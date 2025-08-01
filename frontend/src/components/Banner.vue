<script setup>
    import { useIsMobile } from '../stores/mobile.js';
    const { isMobile } = useIsMobile();
</script>
<template>
    <header>
        <div class="container" :class="{mobile: isMobile}">
            <h1>
                <slot name="title">Banner title</slot>
            </h1>
            <p>
                <slot name="description"></slot>
            </p>
            <div class="extra" v-if="$slots.default">
                <slot />
            </div>
        </div>
    </header>
</template>
<style scoped>
    header {
        width: 100vw;
        position: relative;
        left: 50%;
        right: 50%;
        margin-left: -50vw;
        margin-right: -50vw;
        margin-bottom: var(--spacing);
        background-color: var(--color-main);
        padding: calc(var(--padding) * 2) var(--padding);

        color: white;
    }

    .container {
        padding-left: calc(var(--padding) * 4);
        padding-right: calc(var(--padding) * 4);
    }

    .mobile {
        text-align: center;
        padding-left: var(--padding);
        padding-right: var(--padding);
    }

    .extra {
        padding: var(--padding);
    }

    h1 {
        font-weight: bold;
    }
</style>
