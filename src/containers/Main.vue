<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
import { useRoute } from 'vue-router'

const $route = useRoute()
</script>

<template>
  <AppHeader who="main"></AppHeader>
  <main id="app-main" class="app-main">
    <RouterView></RouterView>
  </main>
</template>

<style lang="scss">
#app-header {
  flex-shrink: 0;
}

#app-main {
  flex: 1 0 auto;

  > * {
    width: 100%;
    height: 100%;
  }
}
</style>
