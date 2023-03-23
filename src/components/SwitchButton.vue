<template>
  <button
    v-for="(option, index) in options"
    :key="option"
    :disabled="currentOption === option"
    :class="{
      'bg-zinc-700': currentOption !== option,
      'mr-2': index !== options.length - 1,
    }"
    @click="handleClick"
  >
    {{ option }}
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<(e: 'update', value: string) => void>()

const props = defineProps<{
  options: string[]
  selected?: string
}>()

let currentOption = ref(props.selected ?? props.options[0])

const handleClick = (event: MouseEvent) => {
	const target = event.target as HTMLButtonElement
	currentOption.value = target.innerText
	emit('update', currentOption.value)
}
</script>
