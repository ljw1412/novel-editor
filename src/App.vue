<script setup lang="ts"></script>

<template>
  <router-view></router-view>
</template>

<style lang="scss">
body {
  color: var(--app-color-text);
  background-color: var(--app-color-bg);
  transition: color 0.2s ease-out, background-color 0.3s ease-out;
  will-change: color, background-color;
}

#app {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

#app-header,
#app-header-mini {
  flex-shrink: 0;
}

#app-main,
#app-separate {
  flex: 1 0 auto;
  border: 1px solid rgba(var(--app-theme-rgb), var(--app-border-opacity));
  border-top: none;
  transition: border-color 0.2s ease-out;

  > * {
    width: 100%;
    height: 100%;
  }
}
</style>
