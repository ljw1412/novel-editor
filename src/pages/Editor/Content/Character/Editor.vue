<script setup lang="ts" name="CharacterEditor">
import { ref, reactive } from 'vue'
import { useDebounceFn, useEventListener } from '@vueuse/core'
import { useEditorStore } from '/@/stores'
import ContentContainer from '../../components/ContentContainer.vue'
import CharacterTimeline from './components/Timeline.vue'

const editorStore = useEditorStore()

const saveState = ref({ status: '', icon: '', message: '' })
const clearSaveMsg = useDebounceFn(() => {
  saveState.value = { status: '', icon: '', message: '' }
}, 3000)

async function save() {
  saveState.value = {
    status: 'saving',
    icon: 'icon-loading',
    message: '保存中…'
  }
  await editorStore.saveActionData('character')
  saveState.value = {
    status: 'success',
    icon: 'icon-check',
    message: '保存成功'
  }
  clearSaveMsg()
}

useEventListener('keydown', (e) => {
  const keyCode = e.keyCode || e.which || e.charCode
  const ctrlKey = e.ctrlKey || e.metaKey
  if (ctrlKey && keyCode == 83) {
    e.preventDefault()
    save()
  }
  return false
})
</script>

<template>
  <ContentContainer class="character-editor">
    <template #extra>
      <div
        v-if="saveState.status"
        :class="{
          'text-red-500': saveState.status === 'error',
          'text-green-500': saveState.status === 'success'
        }"
      >
        <component v-if="saveState.icon" :is="saveState.icon" />
        <span class="ml-2">{{ saveState.message }}</span>
      </div>
    </template>
    <template #default="{ page }">
      <a-space direction="vertical" fill class="pt-4">
        <a-input v-model="page.title" placeholder="姓名" class="name-input" />
        <a-space>
          <a-select
            v-model="page.sex"
            allow-create
            allow-clear
            placeholder="未设置性别"
            class="w-[160px]"
            :trigger-props="{ autoFitPopupMinWidth: true }"
          >
            <template #prefix>性别</template>
            <a-option>男</a-option>
            <a-option>女</a-option>
            <template #footer>
              <div class="text-center text-color-2">或手动输入</div>
            </template>
          </a-select>

          <a-input v-model="page.birthday" placeholder="生日" class="w-[200px]">
            <template #prefix>生日</template>
          </a-input>
        </a-space>
      </a-space>

      <CharacterTimeline
        :character="page"
        @item-image-change="save"
        @item-image-removed="save"
      ></CharacterTimeline>
    </template>
  </ContentContainer>
</template>

<style lang="scss">
.character-editor {
  .name-input {
    // height: 42px;
    font-size: 28px;
    line-height: 1;

    > .arco-input {
      font-size: inherit !important;
      line-height: inherit !important;
    }
  }
}
</style>
