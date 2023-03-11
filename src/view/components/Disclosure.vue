<template>
  <details
    :open="state"
    @toggle="toggleState"
  >
    <summary
      :tabindex="disabled ? -1 : 0"
      class="flex justify-between items-center cursor-pointer"
    >
      <span class="text-sm font-medium text-gray-300">
        {{ title }}
      </span>
      <ChevronDown
        v-if="state"
        class="text-base"
      />
      <ChevronRight
        v-else
        class="text-base"
      />
    </summary>
    <!-- @slot Use this slot to render disclosure content when expanded. -->
    <slot />
  </details>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import ChevronDown from '~icons/mdi/chevron-down'
import ChevronRight from '~icons/mdi/chevron-right'

const props = withDefaults(defineProps<{
	title: string,
	open?: boolean,
  disabled?: boolean,
}>(), {
	open: false,
	disabled: false,
})

let state = ref(props.open)

const toggleState = () => {
	state.value = !state.value
}
</script>

<style scoped>
details summary::-webkit-details-marker {
  display:none;
}
</style>
