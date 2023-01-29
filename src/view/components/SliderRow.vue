<template>
  <div class="flex justify-between mt-2">
    <label class="w-1/3 text-sm font-medium text-gray-300">{{ props.label }}</label>

    <div class="flex w-2/3 items-center">
      <p class="mr-2 text-sm font-medium text-gray-300 w-8">
        {{ value }}
      </p>
      <input
        :id="props.id"
        v-model="value"
        type="range"
        :min="props.min ?? 0"
        :max="props.max ?? 100"
        :step="props.step ?? 1"
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
	id?: string
	value: string | number | boolean
	label: string
	min?: number
	max?: number
	step?: number
}>()

const value = ref(props.value)
</script>
