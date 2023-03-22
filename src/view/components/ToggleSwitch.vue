<template>
  <label class="relative mb-4 inline-flex cursor-pointer items-center">
    <input :id="props.id" type="checkbox" :value="value" class="peer sr-only" />
    <div
      class="peer h-6 w-11 rounded-full border-gray-600 bg-gray-700 after:absolute after:top-[0.1rem] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#2174b8] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-2 peer-focus:ring-[#2174b8]"
    />
    <span class="ml-3 text-sm font-medium text-gray-300">{{ label }}</span>
  </label>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    id?: string
    value?: boolean
    label: string
  }>(),
  {
    id: undefined,
    value: false,
  },
)

const value = ref(props.value)
</script>
