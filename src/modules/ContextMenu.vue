<template>
  <div
    class="absolute rounded-md border border-border bg-[#202125] px-4 py-2 text-white"
    :style="{
      left: `${x}px`,
      top: `${y}px`,
    }"
  >
    <p class="mb-2 text-lg">{{ contextName }}</p>
    <div class="flex justify-between space-x-2">
      <IconButton padRight padTop popperContent="Add File" @click="addFile">
        <FileIcon width="1.25rem" height="1.25rem" />
      </IconButton>
      <IconButton
        v-if="mode === 'Directory'"
        padRight
        padTop
        popperContent="Add Folder"
      >
        <FolderIcon width="1.25rem" height="1.25rem" />
      </IconButton>
      <IconButton padRight padTop popperContent="Favorite">
        <StarIcon width="1.25rem" height="1.25rem" />
      </IconButton>
      <IconButton padRight padTop popperContent="Rename">
        <RenameIcon width="1.25rem" height="1.25rem" />
      </IconButton>
      <IconButton padRight padTop popperContent="Copy Path">
        <CopyIcon width="1.25rem" height="1.25rem" />
      </IconButton>
      <IconButton padTop popperContent="Delete" @click="deleteFile">
        <DeleteIcon width="1.25rem" height="1.25rem" />
      </IconButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconButton from '../components/IconButton.vue'

import CopyIcon from '~icons/mdi/content-copy'
import DeleteIcon from '~icons/mdi/delete'
import FileIcon from '~icons/mdi/file'
import FolderIcon from '~icons/mdi/folder'
import RenameIcon from '~icons/mdi/rename'
import StarIcon from '~icons/mdi/star'

const props = defineProps<{
  x: number
  y: number
  contextName: string
  contextPath: string
  mode: 'Interaction' | 'Directory'
}>()

const addFile = () => {
	vscode.postMessage({
		command: 'createFile',
		text: {
			fileConnectionPath: props.contextPath,
			fileConnectionName: props.contextName,
			newFileName: 'Test.ts',
		},
	})
}

const deleteFile = () => {
	vscode.postMessage({
		command: 'deleteFile',
		text: {
			file: props.contextPath,
		},
	})
}
</script>
