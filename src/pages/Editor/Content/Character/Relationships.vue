<script setup lang="ts" name="CharacterRelationships">
import { onMounted, ref, computed } from 'vue'
import { usePointerSwipe, useResizeObserver } from '@vueuse/core'
import { useEditorStore } from '/@/stores'
import { only } from '/@/utils/object'
import draw from './RelationshipsDraw'

const wrapEl = ref<HTMLElement>()
const svgWidth = ref(0)
const svgHeight = ref(0)
useResizeObserver(wrapEl, (entries) => {
  const entry = entries[0]
  const { width, height } = entry.contentRect
  svgWidth.value = width
  svgHeight.value = height
})

const characterList = useEditorStore().character.list
const links: { source: string; target: string; [K: string]: any }[] = []
const nodes: Record<string, any> = {}
const characterIds = characterList.map((item) => item.id)
// 获取双向关系的角色对
const a2bMap = characterList
  .map((character) =>
    character.relations.map((item) => [
      character.id + '-' + item.target,
      item.target + '-' + character.id
    ])
  )
  .flat(2)
  .reduce((obj, item) => {
    obj[item] ?? (obj[item] = -1)
    obj[item]++
    return obj
  }, {} as Record<string, any>)

characterList.forEach((character) => {
  nodes[character.id] = only(character, 'id avatar title timepoint')
  character.relations.forEach((item) => {
    if (!item.target || !characterIds.includes(item.target)) return
    const type = a2bMap[character.id + '-' + item.target]
    a2bMap[item.target + '-' + character.id]++
    links.push({
      source: character.id,
      target: item.target,
      type,
      relation: item.relation
    })
  })
})
// console.log(a2bMap)

const markerArrowList = [
  { id: 'arrow', color: '#999' },
  { id: 'arrow-green', color: 'green' },
  { id: 'arrow-orange', color: 'orange' }
]

onMounted(() => {
  draw(nodes, links)
})

const ratio = ref(1)
const dx = ref(0)
const dy = ref(0)
const sliderValue = computed({
  get() {
    return Math.round((1 / ratio.value) * 10000) / 100
  },

  set(v) {
    ratio.value = 100 / v
  }
})
const viewBox = computed(() => {
  const baseWith = svgWidth.value * ratio.value
  const baseHeight = svgHeight.value * ratio.value

  return [
    -baseWith / 2 - dx.value,
    -baseHeight / 2 - dy.value,
    baseWith,
    baseHeight
  ]
})

const isNode = ref(false)
const isDragging = ref(false)
usePointerSwipe(wrapEl, {
  onSwipeStart: (e) => {
    const target = e.target as HTMLElement
    if (target) {
      isNode.value = target.classList.contains('character-node')
    }
    if (!isNode.value) isDragging.value = true
  },

  onSwipe(e) {
    const { movementX, movementY } = e
    if (isNode.value && !isDragging.value) return
    dx.value += movementX * ratio.value
    dy.value += movementY * ratio.value
  },

  onSwipeEnd(e, direction) {
    isNode.value = false
    isDragging.value = false
  }
})

function handleWheel(e: WheelEvent) {
  const base = e.deltaY < 0 ? -1 : 1
  const d = Math.round((ratio.value + base / 10) * 100) / 100
  ratio.value = Math.max(0.4, Math.min(d, 2))
}

function reset() {
  ratio.value = 1
  dx.value = 0
  dy.value = 0
}
</script>

<template>
  <div
    ref="wrapEl"
    class="character-relationships w-full h-full overflow-hide"
    :class="{ 'dragging cursor-grabbing': isDragging }"
    @wheel="handleWheel"
  >
    <svg
      id="character-relationships"
      xmlns="https://www.w3.org/2000/svg"
      xmlns:xlink="https://www.w3.org/1999/xlink"
      class="select-none"
      :viewBox="viewBox.join(',')"
    >
      <defs>
        <!-- 预设圆角裁切 -->
        <clipPath id="clip">
          <rect x="-30" y="-30" width="60" height="60" rx="30" />
        </clipPath>
        <!-- 预设不同颜色的箭头 -->
        <marker
          v-for="item of markerArrowList"
          :key="item.id"
          :id="item.id"
          markerUnits="userSpaceOnUse"
          viewBox="0 -5 10 10"
          refX="80"
          refY="0"
          markerWidth="8"
          markerHeight="8"
          orient="auto"
          stroke-width="2"
        >
          <path d="M0,-5L10,0L0,5" :fill="item.color"></path>
        </marker>
      </defs>
    </svg>

    <a-space class="actions absolute right-3 bottom-3" @pointerdown.stop>
      <a-slider
        v-model="sliderValue"
        :style="{ width: '150px' }"
        :min="50"
        :max="250"
      />

      <a-button size="small" @click.stop="reset">
        <template #icon><icon-refresh /></template>
      </a-button>
    </a-space>
  </div>
</template>

<style lang="scss"></style>
