<template>
  <input
    :id="props.id"
    v-model="value"
    type="range"
    :min="props.min ?? 0"
    :max="props.max ?? 5"
    :step="props.step"
    class="mr-2"
  >
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
	id?: string
	value: string | number | boolean
	min?: number
	max?: number
	step?: number
}>()

const value = ref(props.value)
</script>
