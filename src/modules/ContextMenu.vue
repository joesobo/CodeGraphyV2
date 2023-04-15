<template>
  <div
    class="absolute rounded-md border border-border bg-[#202125] px-4 py-2 text-white"
    :style="{
      left: `${x}px`,
      top: `${y}px`,
    }"
  >
    <p class="mb-2">{{ contextName }}</p>
    <div class="flex justify-between space-x-2">
      <IconButton popperContent="Add File">
        <FileIcon width="1.25rem" height="1.25rem" />
      </IconButton>
      <IconButton popperContent="Add File">
        <FolderIcon width="1.25rem" height="1.25rem" />
      </IconButton>
      <IconButton popperContent="Add File">
        <StarIcon width="1.25rem" height="1.25rem" />
      </IconButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconButton from '../components/IconButton.vue'

import FileIcon from '~icons/mdi/file'
import FolderIcon from '~icons/mdi/folder'
import StarIcon from '~icons/mdi/star'

defineProps<{
  x: number
  y: number
  contextName: string
  mode: 'Interaction' | 'Directory'
}>()
</script>
