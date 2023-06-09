<script setup lang="ts" name="CharacterTimeline">
import { computed, PropType, ref } from 'vue'
import { Modal, Notification } from '@arco-design/web-vue'
import Character, { CharacterTimeline } from '/@/classes/Character'
import { useEditorStore } from '/@/stores'
import ExtraInfo from './ExtraInfo.vue'
import CharacterFgimage from './Fgimage.vue'
import CharacterRelations from './Relations.vue'

const props = defineProps({
  character: { type: Object as PropType<Character>, default: () => ({}) }
})
const $emit = defineEmits(['item-image-change', 'item-image-removed'])

type MixedTimelineItem = CharacterTimeline & {
  name: string
  default?: boolean
  data: { timepoint?: string }
}

const timeline = computed(() => props.character.timeline || [])
const defaultTimepoint = computed(() => ({
  name: '初登场',
  targetId: '',
  default: true,
  data: props.character
}))
const timelineList = computed<MixedTimelineItem[]>(() => [
  defaultTimepoint.value,
  ...timeline.value.map((item) => ({
    name: getTimePonitName(item.targetId),
    ...item
  }))
])

const editorStore = useEditorStore()
const worldTimeline = editorStore.getWorldPaneData('timeline')
const treeData = computed(() => {
  const { name } = defaultTimepoint.value
  return worldTimeline.map((item) => {
    return {
      key: item.id,
      title: item.title,
      markerTitle: item.title,
      disabled: true,
      children: item.children.map((child) => {
        const key = child.id
        const title = item.title + child.title
        const marker = props.character.timepoint === key ? `(${name})` : ''
        return {
          key,
          title,
          markerTitle: title + marker,
          disabled:
            key === props.character.timepoint ||
            timeline.value.some((item) => item.targetId === key)
        }
      })
    }
  })
})
const allTimePoint = computed(() =>
  treeData.value.map((item) => item.children).flat()
)
const tab = ref('')
const isDisplayNameDialog = ref(false)
const timePointName = ref({ label: '', value: '' })

function showInputDialog() {
  timePointName.value = { label: '', value: '' }
  isDisplayNameDialog.value = true
}

function createTimePoint(targetId: string) {
  return {
    targetId,
    data: {
      content: '',
      image: '',
      avatar: '',
      age: '',
      info: [],
      relations: []
    }
  }
}

function getTimePonitName(id: string) {
  const timepoint = allTimePoint.value.find((item) => item.key === id)
  if (timepoint) return timepoint.title
  return '(已删除)'
}

function addTimeline() {
  const { label, value } = timePointName.value
  const name = label.trim()
  if (value) {
    if (timeline.value.some((item) => item.targetId === value)) {
      Notification.warning({
        title: `无法添加时间点“${name}”`,
        content: '已经存在同名的时间点',
        position: 'bottomRight',
        duration: 3 * 1000,
        closable: true
      })
      return false
    }
    const timepoint = createTimePoint(value)
    timeline.value.push(timepoint)
    tab.value = timepoint.targetId
    return true
  }
  return false
}

function removeTimeline(key: string | number) {
  const timepoint = timeline.value.find((item) => item.targetId === key)
  if (timepoint) {
    Modal.confirm({
      title: '删除时间点',
      content: `确认删除时间点“${getTimePonitName(timepoint.targetId)}”吗？`,
      modalStyle: { 'text-align': 'center' },
      onOk: () => {
        const index = timeline.value.indexOf(timepoint)
        if (~index) timeline.value.splice(index, 1)
        if (tab.value === timepoint.targetId) tab.value = ''
      }
    })
  }
}
</script>

<template>
  <div class="character-timeline w-full mt-5">
    <a-tabs
      v-model:active-key="tab"
      editable
      show-add-button
      lazy-load
      type="card"
      size="medium"
      @add="showInputDialog"
      @delete="removeTimeline"
    >
      <template #extra>
        <!-- <a-button size="mini" type="outline" title="排序">
          <template #icon><icon-sort /></template>
        </a-button> -->
      </template>
      <a-tab-pane
        v-for="(point, index) of timelineList"
        :key="point.targetId"
        :title="point.name"
        :closable="!point.default"
      >
        <div class="flex items-start px-4 pb-4">
          <div class="flex-shrink-0 w-[308px] mr-2">
            <CharacterFgimage
              :data="point.data"
              :title="
                point.targetId
                  ? `${character.title}_${point.targetId}`
                  : character.title
              "
              @change="$emit('item-image-change')"
              @removed="$emit('item-image-removed')"
            />

            <CharacterRelations
              :character="character"
              :relations="point.data.relations"
            >
            </CharacterRelations>
          </div>

          <a-space direction="vertical" fill class="flex-grow w-0">
            <a-space>
              <a-tree-select
                v-if="point.default"
                v-model="point.data.timepoint"
                allow-clear
                placeholder="绑定初登场时间点"
                :data="treeData"
              >
                <template #prefix>时间点</template>
              </a-tree-select>

              <a-input
                v-model="point.data.age"
                placeholder="(选填)"
                class="w-[130px]"
              >
                <template #prefix>年龄</template>
                <template #suffix>岁</template>
              </a-input>
            </a-space>

            <ExtraInfo :list="point.data.info"></ExtraInfo>

            <a-textarea
              v-model="point.data.content"
              :auto-size="{ minRows: 10 }"
              placeholder="请输入这个时间点的人物描述和设定"
            ></a-textarea>
          </a-space>
        </div>
      </a-tab-pane>
    </a-tabs>

    <a-modal
      v-model:visible="isDisplayNameDialog"
      simple
      title="创建时间点"
      width="400px"
      :ok-button-props="{ disabled: !timePointName.value.trim() }"
      :on-before-ok="addTimeline"
    >
      <a-tree-select
        v-model="timePointName"
        :data="treeData"
        :field-names="{ title: 'markerTitle' }"
        label-in-value
        placeholder="请选择已创建的时间点"
      ></a-tree-select>
    </a-modal>
  </div>
</template>

<style lang="scss">
.character-timeline {
  .arco-tabs-nav-type-card {
    .arco-tabs-tab:hover {
      background-color: rgba(var(--primary-6), 0.15);
    }

    .arco-tabs-tab-active,
    .arco-tabs-tab-active:hover {
      background-color: rgba(var(--primary-6), 0.02);
      border-bottom-color: var(--app-color-bg);
    }
  }
  .arco-tabs-content {
    background-color: rgba(var(--primary-6), 0.02);
  }
}
</style>
