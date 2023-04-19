<script setup lang="ts">
import { useRoute } from 'vue-router'

const $emit = defineEmits(['add'])
const props = defineProps({ showAddBtn: Boolean, addBtnTitle: String })
const $route = useRoute()
</script>

<template>
  <div class="editor-sidebar flex flex-col h-full shadow-xl">
    <header
      class="sidebar-header layout-lr h-[40px] px-3 shadow-sm flex-shrink-0"
    >
      <section>{{ $route.meta.title }}</section>
      <a-space size="mini">
        <slot name="extra"></slot>
        <div
          v-if="showAddBtn"
          class="text-btn w-5 h-5 layout-center rounded cursor-pointer"
          :title="addBtnTitle || `新建${$route.meta.title}`"
          @click="$emit('add')"
        >
          <icon-plus />
        </div>
      </a-space>
    </header>
    <section class="sidebar-content flex-grow h-0">
      <slot></slot>
    </section>
  </div>
</template>

<style lang="scss">
.editor-sidebar {
  background-color: var(--editor-sidebar-bg);

  .sidebar-header {
    border-bottom: 1px solid var(--color-border);
  }

  .arco-collapse {
    border-radius: initial;
  }

  .arco-collapse-item {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    border-bottom: none;

    &.arco-collapse-item-active {
      height: 0;
      flex-grow: 1;
    }

    .arco-collapse-item-header {
      padding-top: 0;
      padding-bottom: 0;
      padding-right: 4px;
      padding-left: 24px;
      min-height: 28px;
      line-height: 1;
      border-color: none;
      background-color: var(--color-bg-4);

      .arco-icon-hover {
        left: 6px;
      }

      &:focus {
        outline: 1px solid var(--app-color-common);
        outline-offset: -1px;
      }
    }

    .arco-collapse-item-content {
      background-color: initial;
      padding: 0;

      .arco-collapse-item-content-box {
        padding: 0;
        height: 100%;
      }
      &.arco-collapse-item-content-expend {
        height: 100% !important;
      }
    }

    .arco-collapse-item-header-extra {
      .btn-add,
      .btn-collapse {
        opacity: 0;
      }
    }

    &:hover,
    &:focus-within {
      .arco-collapse-item-header-extra {
        .btn-add,
        .btn-collapse {
          opacity: 1;
        }
      }

      .editor-page-item {
        .children::before {
          opacity: 0.15;
        }
      }
    }
  }
}
</style>
