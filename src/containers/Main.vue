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

<style lang="scss"></style>
