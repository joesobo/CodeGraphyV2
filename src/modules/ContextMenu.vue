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

    <!-- Add Folder -->
    <form v-if="creatingFolder" class="flex">
      <input
        v-model="newFolderName"
        type="text"
        class="mr-2 border border-border text-white"
      />
      <button type="submit" @click="addFolder">Add Folder</button>
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
          v-if="canCreateFolder"
          padRight
          padTop
          popperContent="Add Folder"
          @click="startCreatingFolder"
        >
          <FolderIcon width="1.25rem" height="1.25rem" />
        </IconButton>
        <IconButton
          v-if="canFavorite"
          padRight
          padTop
          popperContent="Favorite"
          @click="favoriteFile"
        >
          <StarIcon width="1.25rem" height="1.25rem" />
        </IconButton>
        <IconButton padRight padTop popperContent="Rename">
          <RenameIcon width="1.25rem" height="1.25rem" />
        </IconButton>
        <IconButton padRight padTop popperContent="Copy Path" @click="copyPath">
          <CopyIcon width="1.25rem" height="1.25rem" />
        </IconButton>
        <IconButton padTop popperContent="Delete" @click="deleteNode">
          <DeleteIcon width="1.25rem" height="1.25rem" />
        </IconButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue'

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

const creatingFolder = ref(false)
const newFolderName = ref('')

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

const canCreateFolder = computed(() => props.contextNode.type === 'Directory')
const canFavorite = computed(() => props.contextNode.type !== 'Directory')

const startCreatingFile = () => {
	creatingFile.value = true
}

const startCreatingFolder = () => {
	creatingFolder.value = true
}

const addFile = () => {
	vscode.postMessage({
		command: 'createFile',
		text: {
			nodeConnection: {
				...props.contextNode,
			},
			newFileName: newFileName.value,
		},
	})

	creatingFile.value = false
	newFileName.value = ''
	emit('close')
}

const addFolder = () => {
	vscode.postMessage({
		command: 'createFolder',
		text: {
			nodeConnection: {
				...props.contextNode,
			},
			newFolderName: newFolderName.value,
		},
	})

	creatingFolder.value = false
	newFolderName.value = ''
	emit('close')
}

const favoriteFile = () => {
	vscode.postMessage({
		command: 'favoriteFile',
		text: {
			node: {
				...props.contextNode,
			},
		},
	})
	emit('close')
}

const copyPath = () => {
	vscode.postMessage({
		command: 'copyPath',
		text: {
			path: props.contextNode.fullPath,
		},
	})
	emit('close')
}

const deleteNode = () => {
	vscode.postMessage({
		command: 'deleteNode',
		text: {
			node: { ...props.contextNode },
		},
	})
	emit('close')
}
</script>
