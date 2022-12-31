<template>
  <div class="flex justify-between mt-4">
    <label class="w-1/3">{{ props.label }}</label>

    <div class="flex w-2/3 items-center">
      <p class="mr-2">
        {{ value }}
      </p>
      <input
        v-model="value"
        type="range"
        min="0"
        max="100"
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
	value: string | number | boolean
	label: string
}>()

const value = ref(props.value)
</script>
