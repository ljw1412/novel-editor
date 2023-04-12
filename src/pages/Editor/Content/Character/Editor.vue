<script setup lang="ts" name="CharacterEditor">
import { ref, reactive } from 'vue'
import { useDebounceFn, useEventListener } from '@vueuse/core'
import { useEditorStore } from '/@/stores'
import ContentContainer from '../../components/ContentContainer.vue'
import ExtraInfo from './components/ExtraInfo.vue'
import CharacterTimeline from './components/Timeline.vue'
import Fgimage from './components/Fgimage.vue'

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
      <div class="flex items-start pt-4">
        <Fgimage
          :data="page"
          :title="page.title"
          width="320px"
          class="mr-2 flex-shrink-0"
          @change="save"
          @removed="save"
        />

        <a-space direction="vertical" fill class="flex-grow">
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

            <a-input v-model="page.age" placeholder="年龄" class="w-[140px]">
              <template #prefix>年龄</template>
              <template #suffix>岁</template>
            </a-input>
            <a-input
              v-model="page.birthday"
              placeholder="生日"
              class="w-[200px]"
            >
              <template #prefix>生日</template>
            </a-input>
          </a-space>

          <ExtraInfo :list="page.info"></ExtraInfo>

          <a-textarea
            v-model="page.content"
            placeholder="请输入人物描述和设定"
            :auto-size="{ minRows: 6, maxRows: 6 }"
          ></a-textarea>
        </a-space>
      </div>

      <CharacterTimeline
        :title="page.title"
        :timeline="page.timeline"
        @item-image-change="save"
        @item-image-removed="save"
      ></CharacterTimeline>
    </template>
  </ContentContainer>
</template>

<style lang="scss">
.character-editor {
  line-height: 1;

  .name-input {
    // height: 42px;
    font-size: 28px;

    > .arco-input {
      font-size: inherit !important;
      line-height: inherit !important;
    }
  }

  .sprite,
  .avatar {
    // outline: 1px solid var(--app-color-common);
    background-color: var(--color-fill-2);

    img {
      position: relative;
      z-index: 1;
    }

    .label {
      z-index: 0;
      opacity: 0.5;
      font-size: 16px;
    }

    .action-view {
      transition: all 0.2s;
      opacity: 0;
      z-index: 5;
    }

    &:hover {
      .action-view {
        opacity: 1;
        background-color: rgba(0, 0, 0, 0.5);
      }
    }
  }
}
</style>
