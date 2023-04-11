<template>
  <label class="relative mb-4 inline-flex cursor-pointer items-center">
    <input
      :id="props.id"
      type="checkbox"
      :checked="checked"
      class="peer sr-only"
      @change="handleChange"
    />
    <div
      class="peer h-6 w-11 rounded-full border-gray-600 bg-gray-700 after:absolute after:left-[2px] after:top-[0.1rem] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#2174b8] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-2 peer-focus:ring-[#2174b8]"
    />
    <span class="ml-3 text-sm font-light text-gray-300">{{ label }}</span>
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
	defineProps<{
    id?: string
    modelValue?: boolean
    label: string
  }>(),
	{
		id: undefined,
		modelValue: false,
	},
)

const emits = defineEmits<(e: 'update:modelValue', checked: boolean) => void>()

const checked = computed<boolean>({
	get() {
		return props.modelValue || false
	},
	set(value: boolean) {
		emits('update:modelValue', value)
	},
})

const handleChange = (event: Event) => {
	checked.value = (event.target as HTMLInputElement).checked
}
</script>
