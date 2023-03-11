<template>
  <Menu
    as="div"
    class="relative inline-block text-left"
  >
    <div>
      <MenuButton class="inline-flex w-full justify-center gap-x-1.5 bg-primary px-3 py-2 text-foreground">
        {{ title }}
        <ChevronDown
          class="-mr-1 h-5 w-5 text-foreground"
          aria-hidden="true"
        />
      </MenuButton>
    </div>

    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <MenuItems class="absolute right-0 z-10 mt-2 w-56 origin-top-right bg-dropdown">
        <MenuItem
          v-for="option in options"
          :key="option"
        >
          <button
            href="#"
            :class="[active === option ? 'bg-primary-hover text-foreground' : 'text-foreground', 'block bg-dropdown px-4 py-2 hover:bg-white hover:text-gray-800']"
            @click="setActive(option)"
          >
            {{ option }}
          </button>
        </MenuItem>
      </MenuItems>
    </transition>
  </Menu>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'

import ChevronDown from '~icons/mdi/chevron-down'

const props = defineProps<{
	title: string
	options: string[],
	initialActive?: string
}>()

const emit = defineEmits<(e: 'update', value: string) => void>()

let active = ref(props.initialActive || '')

const setActive = (value: string) => {
	active.value = value
	emit('update', value)
}
</script>
