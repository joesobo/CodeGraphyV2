<template>
  <label class="relative inline-flex items-center mb-4 cursor-pointer">
    <input
      :id="props.id"
      type="checkbox"
      :value="value"
      class="sr-only peer"
    >
    <div class="w-11 h-6 rounded-full peer peer-focus:ring-2 peer-focus:ring-[#2174b8] bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all border-gray-600 peer-checked:bg-[#2174b8]" />
    <span class="ml-3 text-sm font-medium text-gray-300">{{ label }}</span>
  </label>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
	id?: string
	value?: boolean
	label: string
}>(), {
	id: undefined,
	value: false
})

const value = ref(props.value)
</script>
