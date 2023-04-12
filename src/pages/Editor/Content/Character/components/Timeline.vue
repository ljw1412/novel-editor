<script setup lang="ts" name="CharacterTimeline">
import { computed, PropType, ref } from 'vue'
import { Modal, Notification } from '@arco-design/web-vue'
import { CharacterTimeline } from '/@/classes/CharacterPage'
import { useEditorStore } from '/@/stores'
import ExtraInfo from './ExtraInfo.vue'
import Fgimage from './Fgimage.vue'

const props = defineProps({
  title: { type: String, default: '' },
  timeline: { type: Array as PropType<CharacterTimeline[]>, default: () => [] }
})
const $emit = defineEmits(['item-image-change', 'item-image-removed'])

const editorStore = useEditorStore()
const worldTimeline = editorStore.getWorldPaneData('timeline')
const treeData = computed(() => {
  return worldTimeline.map((item) => {
    return {
      key: item.title,
      title: item.title,
      disabled: true,
      children: item.children.map((child) => {
        const name = item.title + child.title
        return {
          key: name,
          title: name,
          disabled: props.timeline.some((item) => item.name === name)
        }
      })
    }
  })
})
const tab = ref('')
const isDisplayNameDialog = ref(false)
const timePointName = ref('')

function showInputDialog() {
  timePointName.value = ''
  isDisplayNameDialog.value = true
}

function createTimePoint(name: string) {
  return {
    name,
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

function addTimeline() {
  const name = timePointName.value.trim()
  if (name) {
    if (props.timeline.some((item) => item.name === name)) {
      Notification.warning({
        title: `无法添加时间点“${name}”`,
        content: '已经存在同名的时间点',
        position: 'bottomRight',
        duration: 3 * 1000,
        closable: true
      })
      return false
    }
    props.timeline.push(createTimePoint(name))
    return true
  }
  return false
}

function removeTimeline(name: string | number) {
  Modal.confirm({
    title: '删除时间点',
    content: `确认删除时间点“${name}”吗？`,
    modalStyle: { 'text-align': 'center' },
    onOk: () => {
      const index = props.timeline.findIndex((item) => item.name === name)
      if (~index) props.timeline.splice(index, 1)
    }
  })
}
</script>

<template>
  <div class="character-timeline">
    <h5 class="mt-6 mb-2">
      <span>时间线</span>
      <span class="text-sm text-color-2">（上述信息默认为故事初始时点）</span>
    </h5>
    <a-tabs
      editable
      show-add-button
      auto-switch
      type="card"
      size="large"
      :hide-content="!timeline.length"
      @add="showInputDialog"
      @delete="removeTimeline"
    >
      <template #extra>
        <a-button size="mini" title="排序">
          <template #icon><icon-sort /></template>
        </a-button>
      </template>
      <a-tab-pane
        v-for="(point, index) of timeline"
        :key="point.name"
        :title="point.name"
      >
        <div class="flex px-4 pb-4">
          <Fgimage
            :data="point.data"
            :title="`${title}_${point.name}`"
            width="320px"
            class="mr-2 flex-shrink-0"
            @change="$emit('item-image-change')"
            @removed="$emit('item-image-removed')"
          />

          <a-space direction="vertical" fill class="flex-grow">
            <ExtraInfo :list="point.data.info">
              <template #prepend>
                <a-grid-item>
                  <a-input
                    v-model="point.data.age"
                    placeholder="此时间点的人物年龄"
                  >
                    <template #prefix>年龄</template>
                    <template #suffix>岁</template>
                  </a-input>
                </a-grid-item>
              </template>
            </ExtraInfo>

            <a-textarea
              v-model="point.data.content"
              placeholder="请输入这个时间点的人物描述和设定"
              :auto-size="{ minRows: 6, maxRows: 6 }"
            ></a-textarea>
          </a-space>
        </div>
      </a-tab-pane>
    </a-tabs>

    <!-- <div>人物关系</div> -->

    <a-modal
      v-model:visible="isDisplayNameDialog"
      :on-before-ok="addTimeline"
      simple
      title="创建时间点"
      width="400px"
      :ok-button-props="{ disabled: !timePointName.trim() }"
    >
      <a-tree-select
        v-model="timePointName"
        :data="treeData"
        placeholder="请选择已创建的时间点"
      ></a-tree-select>
      <!-- <a-input v-model="timePointName" placeholder="请输入时间点的名称" /> -->
    </a-modal>
  </div>
</template>

<style lang="scss"></style>
