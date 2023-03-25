<template>
  <div class="mt-2 flex flex-col justify-between">
    <label class="w-full text-sm font-light text-gray-300">
      {{ label }}
    </label>

    <div class="flex w-full items-center">
      <input
        :id="props.id"
        v-model="sliderValue"
        type="range"
        :min="props.min ?? 0"
        :max="props.max ?? 100"
        :step="props.step ?? 1"
        class="mr-2"
      />
      <p class="w-8 text-sm font-medium text-gray-300">
        {{ value }}
      </p>
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

const sliderValue = ref(props.value)
</script>
