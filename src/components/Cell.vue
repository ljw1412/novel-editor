<script setup lang="ts" name="Cell">
import {
  computed,
  PropType,
  ref,
  StyleValue,
  TransitionProps,
  useAttrs
} from 'vue'
import { RouteLocationRaw, useRouter } from 'vue-router'
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
  // 大小
  size: {
    type: String as PropType<'mini' | 'small' | 'medium'>,
    default: 'medium'
  },
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
  // (link)隐藏右侧链接图标
  hideLinkIcon: Boolean,
  // (select,input) 占位符
  placeholder: String,
  // (collapse) 是否收缩
  collapsed: { type: Boolean, default: undefined },
  // (button) 按钮属性
  buttonProps: { type: Object as PropType<ButtonProps> },
  // 折叠面板样式
  panelStyle: [String, Object, Array] as PropType<StyleValue>
})
const $emit = defineEmits([
  'change',
  'update:modelValue',
  'collapseChange',
  'update:collapsed',
  'buttom-click'
])
const $attrs = useAttrs()
const $router = useRouter()

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
    if (typeof props.link === 'string') {
      window.open(props.link)
    } else {
      $router.replace(props.link)
    }
  }
}

function handleValueChange(v: any) {
  _value.value = v
  $emit('change', v)
  $emit('update:modelValue', v)
}
</script>

<template>
  <div class="cell" :class="`cell--${size}`">
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
          v-if="type === 'collapse'"
          :is="isCollapsed ? 'icon-down' : 'icon-up'"
          :size="16"
        />
        <icon-launch v-else-if="type === 'link' && !hideLinkIcon" :size="16" />
        <a-select
          v-else-if="type === 'select'"
          :placeholder="placeholder"
          :model-value="value as string"
          style="min-width: 220px"
          :size="size"
          @change="handleValueChange"
        >
          <a-option v-for="option of options" v-bind="option"></a-option>
        </a-select>
        <a-switch
          v-else-if="type === 'switch'"
          :model-value="value"
          :size="size === 'medium' ? 'medium' : 'small'"
          @change="handleValueChange"
        ></a-switch>
        <a-input
          v-else-if="type === 'input'"
          :placeholder="placeholder"
          :model-value="value as string"
          :size="size"
          style="min-width: 220px"
          @change="handleValueChange"
        ></a-input>
        <a-button
          v-else-if="type === 'button'"
          :size="size"
          v-bind="buttonProps"
          @click="$emit('buttom-click', $event)"
        >
          {{ value }}
        </a-button>
      </div>
    </div>
    <transition name="cell-fold" v-bind="transitionEvents">
      <div
        v-if="type === 'collapse'"
        v-show="!isCollapsed"
        class="cell__panel"
        :style="panelStyle"
      >
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
  --cell-padding: 14px 14px 14px 20px;
  --cell-icon-size: 24px;
  --cell-gutter: 12px;
  --cell-title-font-size: 14px;
  --cell-title-line-height: 20px;
  --cell-desc-font-size: 13px;
  --cell-desc-line-height: 14px;

  display: flex;
  flex-direction: column;
  border: 1px solid var(--cell-border-color);
  border-radius: var(--border-radius-medium);
  color: var(--color-text-1);
  background-color: var(--color-bg-4);
  overflow: hidden;

  & + & {
    margin-top: 10px;
  }

  &--small {
    --cell-padding: 6px 8px 6px 14px;
    --cell-icon-size: 22px;
    --cell-gutter: 10px;
  }

  &--mini {
    --cell-padding: 2px 6px 2px 8px;
    --cell-icon-size: 20px;
    --cell-gutter: 8px;
    --cell-title-font-size: 13px;
    --cell-title-line-height: 16px;
    --cell-desc-font-size: 12px;
    --cell-desc-line-height: 13px;
  }

  &__item {
    display: flex;
    width: 100%;
    padding: var(--cell-padding);
    user-select: none;

    &.clickable {
      cursor: pointer;
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
    margin-right: var(--cell-gutter);

    .arco-icon,
    .image-icon {
      font-size: var(--cell-icon-size);
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
    font-size: var(--cell-title-font-size);
    line-height: var(--cell-title-line-height);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__desc {
    font-size: var(--cell-desc-font-size);
    line-height: var(--cell-desc-line-height);
    color: var(--color-text-2);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__extra {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    margin-left: var(--cell-gutter);
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
