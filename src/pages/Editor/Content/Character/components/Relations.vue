<script setup lang="ts" name="CharacterRelations">
import { PropType } from 'vue'
import CharacterPage, { CharacterRelation } from '/@/classes/CharacterPage'
import { useEditorStore } from '/@/stores'

const props = defineProps({
  character: { type: Object as PropType<CharacterPage>, default: () => ({}) },
  relations: { type: Array as PropType<CharacterRelation[]>, default: () => [] }
})

const editorStore = useEditorStore()
const characterList = editorStore.character.list.filter(
  (item) => item.title !== props.character.title
)

function createRelation(): CharacterRelation {
  return { target: '', relation: '' }
}

function append() {
  props.relations.push(createRelation())
}

function remove(relation: CharacterRelation) {
  const index = props.relations.indexOf(relation)
  if (~index) props.relations.splice(index, 1)
}

function existsRelations(key: string) {
  return props.relations.some((item) => item.target === key)
}
</script>

<template>
  <div class="character-relations">
    <div v-if="relations.length" class="relative h-[25px]">
      <div class="absolute left-4 h-full w-[2px] bg-current"></div>
    </div>
    <div
      v-for="(relation, index) of relations"
      class="relation-item relative flex items-center h-[52px]"
    >
      <div class="lines relative w-1/2 h-full">
        <div
          class="v-line absolute left-4 w-[2px] bg-current bg"
          :class="index >= relations.length - 1 ? 'h-1/2' : 'h-full'"
        ></div>
        <div
          class="h-line layout-center-py left-4 right-0 h-[2px] bg-current bg-opacity-30"
        ></div>
        <div
          class="arrow absolute top-1/2 right-0 w-[12px] h-[12px] origin-center -translate-y-1/2 rotate-45 border-t-2 border-r-2 border-current"
        ></div>
      </div>
      <a-input
        v-model="relation.relation"
        :title="'目标角色是该角色的' + (relation.relation || '？')"
        placeholder="目标角色是它的"
        size="mini"
        class="relation-input absolute top-0 left-5 w-1/3 px-1 z-10 text-center"
      />
      <a-select
        v-model="relation.target"
        placeholder="目标角色"
        size="small"
        class="w-1/2"
      >
        <a-option
          v-for="character of characterList"
          :key="character.title"
          :value="character.title"
          :label="character.title"
          :disabled="existsRelations(character.title)"
        ></a-option>
      </a-select>
      <a-button
        status="danger"
        type="text"
        size="small"
        @click="remove(relation)"
      >
        <template #icon><icon-delete :size="16" /></template>
      </a-button>
    </div>
    <a-button type="dashed" long class="mt-2" @click="append">
      <icon-plus />新增角色关系
    </a-button>
  </div>
</template>

<style lang="scss">
.character-relations {
  .relation-input {
    > input {
      text-align: center;
    }
  }
}
</style>
