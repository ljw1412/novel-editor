<script setup lang="ts" name="CharacterTimeline">
import { PropType, ref } from 'vue'
import { Modal, Notification } from '@arco-design/web-vue'
import { CharacterTimeline } from '/@/classes/CharacterPage'

const props = defineProps({
  timeline: { type: Array as PropType<CharacterTimeline[]>, default: () => [] }
})

const isDisplayNameDialog = ref(false)
const inputText = ref('')

function showInputDialog() {
  inputText.value = ''
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
  const name = inputText.value.trim()
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
        v-for="(item, index) of timeline"
        :key="item.name"
        :title="item.name"
      >
        {{ item }}
      </a-tab-pane>
    </a-tabs>

    <!-- <div>这个时间点的立绘和照片上传</div>
    <div>人物关系</div> -->
    <a-modal
      v-model:visible="isDisplayNameDialog"
      :on-before-ok="addTimeline"
      simple
      title="创建时间点"
      width="400px"
      :ok-button-props="{ disabled: !inputText.trim() }"
    >
      <a-input v-model="inputText" placeholder="请输入时间点的名称" />
    </a-modal>
  </div>
</template>

<style lang="scss"></style>
