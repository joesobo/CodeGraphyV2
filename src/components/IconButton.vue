<template>
  <Popper :content="popperContent" hover arrow openDelay="500">
    <button
      :id="id"
      class="pointer-events-auto cursor-pointer items-center justify-center bg-transparent p-0 hover:bg-transparent hover:text-primary-hover"
      :class="padding"
    >
      <slot />
    </button>
  </Popper>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Popper from 'vue3-popper'

const props = defineProps<{
  popperContent: string
  id?: string
  padRight?: boolean
	padTop?: boolean
}>()

const padding = computed(() => {
	let value = ''
	if (props.padRight) {
		value += 'mr-4 '
	}
	if (props.padTop) {
		value += 'mt-4 '
	}

	return value
})
</script>
