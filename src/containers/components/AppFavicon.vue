<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  icon: { type: String, default: '' },
  size: { type: Number, default: 16 }
})

const iconType = computed(() => {
  return props.icon.startsWith('icon-') ? props.icon : 'img'
})

const iconProps = computed(() => {
  if (iconType.value === 'img') {
    return { src: props.icon }
  } else {
    return { size: props.size }
  }
})
</script>

<template>
  <div class="app-favicon" :style="{ width: size + 'px', height: size + 'px' }">
    <component v-if="icon" :is="iconType" v-bind="iconProps"></component>
  </div>
</template>

<style lang="scss">
.app-favicon {
  display: inline-flex;
  vertical-align: text-bottom;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}
</style>
