<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import Character from '/@/classes/Character'
import useStore from '/@/stores'

const $route = useRoute()
const $router = useRouter()
const { projectStore, editorStore, cacheStore } = useStore()
const { character } = storeToRefs(editorStore)
defineOptions({ name: 'CharacterHome' })

function handleCharacterClick(item: Character) {
  item.isSelected = true
  editorStore.switchPage('character', item)
  const route = { name: `CharacterEditor`, query: { id: item.id } }
  $router.replace(route)
  cacheStore.setRouteCache('character', route)
}
</script>

<template>
  <a-scrollbar outer-class="sidebar-info h-full" class="h-full overflow-auto">
    <div class="character-home">
      <a-typography-title class="mt-1 mb-1" :heading="4">
        人物列表
      </a-typography-title>
      <div class="character-list grid">
        <a-card
          v-for="item of character.list"
          :body-style="{ padding: 0 }"
          class="rounded-md cursor-pointer hover:border-orange-400"
          @click="handleCharacterClick(item)"
        >
          <div class="character-card-content" :title="item.title">
            <div class="top relative pt-3 mb-1">
              <div class="avatar-wrapper layout-center">
                <a-avatar
                  object-fit="cover"
                  class="mx-auto border-4"
                  :class="{
                    'border-gray-200': !['男', '女'].includes(item.sex),
                    'border-blue-300': item.sex === '男',
                    'border-red-200': item.sex === '女'
                  }"
                  :size="80"
                  :image-url="projectStore.getLocalUrl(item.avatar)"
                >
                  {{ item.title.substring(0, 1) }}
                </a-avatar>
              </div>
              <div
                v-if="item.sex"
                class="sex layout-center"
                :title="`性别:${item.sex}`"
              >
                <icon-man v-if="item.sex === '男'" class="text-blue-600" />
                <icon-woman v-if="item.sex === '女'" class="text-red-600" />
              </div>
              <div v-if="item.age" class="age" :title="`年龄:${item.age}岁`">
                {{ item.age }}
              </div>
            </div>
            <div class="name px-1 py-2 text-center truncate">
              {{ item.title }}
            </div>
          </div>
        </a-card>
      </div>
    </div>
  </a-scrollbar>
</template>

<style lang="scss">
.character-home {
  padding: 16px;
  user-select: none;

  .character-list {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 8px;

    .arco-avatar {
      background-color: var(--color-neutral-4);
    }

    .sex {
      position: absolute;
      left: 2px;
      top: 2px;
      font-size: 20px;
    }

    .age {
      position: absolute;
      right: 4px;
      top: 4px;
      font-size: 14px;
    }
  }
}
</style>
