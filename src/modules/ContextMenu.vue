<template>
  <div
    class="absolute rounded-md border border-border bg-[#202125] px-4 py-2 text-white"
    :style="{
      left: `${x}px`,
      top: `${y}px`,
    }"
  >
    <!-- Add File -->
    <form v-if="creatingFile" class="flex">
      <input
        v-model="newFileName"
        type="text"
        class="mr-2 border border-border text-white"
      />
      <button type="submit" @click="addFile">Add File</button>
    </form>

    <!-- Main Content -->
    <div v-else>
      <p class="mb-2 text-lg">{{ contextNode.name }}</p>

      <div class="flex justify-between space-x-2">
        <IconButton
          padRight
          padTop
          popperContent="Add File"
          @click="startCreatingFile"
        >
          <FileIcon width="1.25rem" height="1.25rem" />
        </IconButton>
        <IconButton
          v-if="canCreateDir()"
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
        <IconButton v-if="canDelete()" padTop popperContent="Delete" @click="deleteFile">
          <DeleteIcon width="1.25rem" height="1.25rem" />
        </IconButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

import type { Node } from '../utils/types'

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
  contextNode: Node
}>()

const emit = defineEmits<{
	(event: 'close'): void
}>()

const creatingFile = ref(false)
const newFileName = ref('')

let handleKeyDown: (event: KeyboardEvent) => void

onMounted(() => {
	handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			emit('close')
		}
	}
	window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
	window.removeEventListener('keydown', handleKeyDown)
})

const canCreateDir = () => {
	return props.contextNode.type === 'Directory'
}

const canDelete = () => {
	return props.contextNode.type !== 'Package'
}

const startCreatingFile = () => {
	creatingFile.value = true
}

const addFile = () => {
	vscode.postMessage({
		command: 'createFile',
		text: {
			fileConnectionPath: props.contextNode.fullPath,
			fileConnectionName: props.contextNode.name,
			newFileName: newFileName.value,
		},
	})

	creatingFile.value = false
	newFileName.value = ''
}

const deleteFile = () => {
	vscode.postMessage({
		command: 'deleteFile',
		text: {
			file: props.contextNode.fullPath,
		},
	})
}
</script>
