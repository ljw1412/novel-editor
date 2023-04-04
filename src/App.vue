<script setup lang="ts"></script>

<template>
  <router-view></router-view>
</template>

<style lang="scss">
body {
  color: var(--app-color-text);
  background-color: var(--app-color-bg);
  transition: color 0.15s ease-out, background-color 0.2s ease-out;
  will-change: color, background-color;
}

#app {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
