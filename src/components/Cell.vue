<script setup lang="ts" name="Cell">
import { computed, PropType, ref, TransitionProps, useAttrs } from 'vue'
import { RouteLocationRaw } from 'vue-router'
import { ButtonProps, SelectOptionData } from '@arco-design/web-vue'
import SVGInject from '@iconfu/svg-inject'

const props = defineProps({
  // 标识名称
  name: String,
  // 标题
  title: String,
  // 描述
  desc: String,
  // 图标
  icon: String,
  // 类型
  type: String as PropType<
    'select' | 'input' | 'switch' | 'link' | 'button' | 'collapse'
  >,
  // 值
  modelValue: { type: [String, Boolean], default: undefined },
  // (select) 选择项
  options: { type: Array as PropType<SelectOptionData[]>, default: () => [] },
  // (link) 链接地址
  link: [Object, String] as PropType<RouteLocationRaw>,
  // (select,input) 占位符
  placeholder: String,
  // (collapse) 是否收缩
  collapsed: { type: Boolean, default: undefined },
  // (button) 按钮属性
  buttonProps: { type: Object as PropType<ButtonProps> }
})
const $emit = defineEmits([
  'change',
  'update:modelValue',
  'collapseChange',
  'update:collapsed',
  'buttom-click'
])
const $attrs = useAttrs()

let defaultValue: string | boolean = false
if (['select', 'input', 'button'].includes(props.type!)) defaultValue = ''
if (['collapse'].includes(props.type!)) defaultValue = true
const _value = ref(props.modelValue ?? defaultValue)
const value = computed(() => props.modelValue ?? _value.value)
const _collapsed = ref(true)
const isCollapsed = computed(() => props.collapsed ?? _collapsed.value)
const clickable = computed(() => {
  return $attrs.onClick || ['link', 'collapse'].includes(props.type!)
})

const transitionEvents: TransitionProps = {
  onEnter: (el: Element) => {
    ;(el as HTMLDivElement).style.height = `${el.scrollHeight}px`
  },
  onAfterEnter: (el: Element) => {
    ;(el as HTMLDivElement).style.height = 'auto'
  },
  onBeforeLeave: (el: Element) => {
    ;(el as HTMLDivElement).style.height = `${el.scrollHeight}px`
  },
  onLeave: (el: Element) => {
    ;(el as HTMLDivElement).style.height = '0'
  }
}

function handleCellClick() {
  if (props.type === 'collapse') {
    const value = !isCollapsed.value
    _collapsed.value = value
    $emit('collapseChange', value)
    $emit('update:collapsed', value)
    return
  } else if (props.type === 'link') {
    if (!props.link) return
    // TODO: 多种情况的打开
  }
}

function handleValueChange(v: any) {
  _value.value = v
  $emit('change', v)
  $emit('update:modelValue', v)
}
</script>

<template>
  <div class="cell">
    <div class="cell__item" :class="{ clickable }" @click="handleCellClick">
      <div v-if="icon || $slots.icon" class="cell__icon">
        <slot name="icon">
          <component v-if="icon && icon.startsWith('icon-')" :is="icon" />
          <img
            v-else-if="icon"
            :src="icon"
            class="image-icon"
            style="width: 1em; height: 1em; object-fit: contain"
            @load="SVGInject($event.target)"
          />
        </slot>
      </div>
      <div class="cell__content">
        <slot name="content">
          <div class="cell__title">{{ title }}</div>
          <div v-if="desc" class="cell__desc">{{ desc }}</div>
        </slot>
      </div>
      <div class="cell__extra">
        <slot name="extra"></slot>
        <component
          v-if="['collapse', 'link'].includes(type!)"
          :is="
            type === 'link'
              ? 'icon-launch'
              : isCollapsed
              ? 'icon-down'
              : 'icon-up'
          "
          :size="16"
        />
        <a-select
          v-else-if="type === 'select'"
          :placeholder="placeholder"
          :model-value="value as string"
          style="min-width: 220px"
          @change="handleValueChange"
        >
          <a-option v-for="option of options" v-bind="option"></a-option>
        </a-select>
        <a-switch
          v-else-if="type === 'switch'"
          :model-value="value"
          @change="handleValueChange"
        ></a-switch>
        <a-input
          v-else-if="type === 'input'"
          :placeholder="placeholder"
          :model-value="value as string"
          style="min-width: 220px"
          @change="handleValueChange"
        ></a-input>
        <a-button
          v-else-if="type === 'button'"
          v-bind="buttonProps"
          @click="$emit('buttom-click', $event)"
        >
          {{ value }}
        </a-button>
      </div>
    </div>
    <transition name="cell-fold" v-bind="transitionEvents">
      <div v-if="type === 'collapse'" v-show="!isCollapsed" class="cell__panel">
        <slot name="panel"></slot>
      </div>
    </transition>
  </div>
</template>

<style lang="scss">
body {
  --cell-border-color: var(--color-border-2);
}

body[arco-theme='dark'] {
  --cell-border-color: var(--color-bg-4);
}

.cell {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--cell-border-color);
  border-radius: var(--border-radius-medium);
  background-color: var(--color-bg-4);
  overflow: hidden;

  & + & {
    margin-top: 12px;
  }

  &__item {
    display: flex;
    width: 100%;
    padding: 14px 14px 14px 20px;
    user-select: none;

    &.clickable {
      &:hover {
        background-color: rgba(var(--app-color-common-rgb), 0.04);
      }

      &:active {
        background-color: rgba(var(--app-color-common-rgb), 0.24);
      }
    }
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-right: 12px;

    .arco-icon,
    .image-icon {
      font-size: 24px;
    }
  }

  &__content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 34px;
    width: 0;
  }

  &__title {
    font-size: 14px;
    line-height: 20px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__desc {
    font-size: 13px;
    line-height: 14px;
    color: var(--color-text-2);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__extra {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    margin-left: 12px;
  }

  &__panel {
    padding-left: 36px;
    border-top: 1px solid var(--color-border-2);

    > .cell {
      border-color: var(--color-bg-4);

      & + .cell {
        margin-top: 0;
        border-top: 1px solid var(--color-border-2);
      }
    }
  }
}

.cell-fold-enter-active,
.cell-fold-leave-active {
  transition: height 0.2s ease-out;
  border-color: transparent;
}

.cell-fold-enter-from,
.cell-fold-leave-to {
  height: 0;
}
</style>
