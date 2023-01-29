<template>
  <div class="mt-4 flex flex-col">
    <div class="flex mt-4 items-center">
      <button @click="emit('resetGraph')">
        Reset Graph
      </button>
    </div>
    <div class="flex mt-4 items-center">
      <label class="w-1/3">Connection</label>
      <div class="flex w-2/3">
        <SwitchButton :options="['Interaction', 'Directory']" />
      </div>
    </div>
    <div class="flex mt-4 items-center">
      <label class="w-1/3">Display</label>
      <div class="flex w-2/3">
        <SwitchButton :options="['Graph', 'Local']" />
      </div>
    </div>
    <div class="flex mt-4 items-center">
      <label class="w-1/3">Node Size</label>
      <div class="flex w-2/3">
        <SwitchButton :options="['Connections', 'Lines', 'Views']" />
      </div>
    </div>
    <div class="mt-4">
      <Disclosure
        title="D3"
      >
        <div class="flex flex-col ml-auto w-2/3">
          <SliderRow
            id="linkForce"
            :value="linkForce"
            label="Link Force"
            :min="-100"
            @input="event => linkForce = event.target.value"
          />
          <SliderRow
            id="linkDistance"
            :value="linkDistance"
            label="Link Distance"
            :max="1000"
            :step="10"
            @input="event => linkDistance = event.target.value"
          />
          <SliderRow
            id="chargeForce"
            :value="chargeForce"
            label="Charge Force"
            :min="-100"
            @input="event => chargeForce = event.target.value"
          />
          <SliderRow
            id="centerForce"
            :value="centerForce"
            label="Center Force"
            :max="1"
            :step="0.01"
            @input="event => centerForce = event.target.value"
          />
        </div>
      </Disclosure>
    </div>
    <div class="mt-4">
      <Disclosure
        title="Extra"
      >
        <div class="flex flex-col w-2/3 ml-auto mt-2">
          <switch>Hide Orphans</switch>
          <switch>Hide Labels</switch>
          <div>Line width</div>
          <div>Line color</div>
          <switch>Node outline</switch>
          <switch>Collisions</switch>
        </div>
      </Disclosure>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, ref } from 'vue'
import SliderRow from './SliderRow.vue'
import Disclosure from './Disclosure.vue'
import SwitchButton from './SwitchButton.vue'

let centerForce: Ref<number> = ref(0)
let chargeForce: Ref<number> = ref(-100)
let linkForce: Ref<number> = ref(0)
let linkDistance: Ref<number> = ref(0)

	interface SettingViewEmits {
  (event: 'resetGraph'): void
}

const emit = defineEmits<SettingViewEmits>()
</script>
