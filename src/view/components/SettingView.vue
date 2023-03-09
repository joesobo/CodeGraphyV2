<template>
  <div class="mt-4 flex flex-col">
    <div class="flex mt-4 items-center">
      <button @click="emit('resetGraph')">
        Reset Graph
      </button>
    </div>
    <div class="flex mt-4 items-center">
      <label class="w-1/3 text-sm font-medium text-gray-300">Connection</label>
      <div class="flex w-2/3">
        <SwitchButton :options="['Interaction', 'Directory']" />
      </div>
    </div>
    <div class="flex mt-4 items-center">
      <label class="w-1/3 text-sm font-medium text-gray-300">Display</label>
      <div class="flex w-2/3">
        <SwitchButton :options="['Graph', 'Local']" />
      </div>
    </div>
    <div class="flex mt-4 items-center">
      <label class="w-1/3 text-sm font-medium text-gray-300">Node Size</label>
      <div class="flex w-2/3">
        <SwitchButton :options="['Connections', 'Lines', 'Views']" />
      </div>
    </div>
    <div class="flex mt-4 items-center">
      <label class="w-1/3 text-sm font-medium text-gray-300">Node Color</label>
      <div class="flex w-2/3">
        <SwitchButton
          :options="['D3', 'Random']"
          :selected="nodeColor"
          @update="(value) => {
            nodeColor = value
            updateGraph()
          }"
        />
      </div>
    </div>
    <Disclosure
      v-if="nodeColor === 'D3'"
      title="Color List"
      class="mt-4"
    >
      <div class="flex flex-col ml-auto w-2/3">
        <div
          v-for="(colorScheme, index) in colorSchemes"
          :key="colorScheme"
          class="flex items-center mb-4"
        >
          <label
            class="text-sm font-medium text-gray-300 w-32"
          >
            {{ colorScheme }}
          </label>
          <input
            type="radio"
            value=""
            :checked="selectedD3Color === index"
            name="default-radio"
            class="!w-4 h-4 text-[#2174b8] focus:ring-[#2174b8] ring-offset-gray-800 focus:ring-2 bg-gray-700 border-gray-600"
            @change="() => {
              selectedD3Color = index
              updateGraph()
            }"
          >
        </div>
      </div>
    </Disclosure>
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
          <ToggleSwitch label="Hide Orphans" />
          <ToggleSwitch label="Hide Labels" />
          <div>Line width</div>
          <div>Line color</div>
          <ToggleSwitch label="Outlines" />
          <ToggleSwitch label="Collions" />
        </div>
      </Disclosure>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, ref } from 'vue'
import SliderRow from './SliderRow.vue'
import ToggleSwitch from './ToggleSwitch.vue'
import Disclosure from './Disclosure.vue'
import SwitchButton from './SwitchButton.vue'
import type { SettingsOptions } from 'utils/types'

const colorSchemes = [
	'Inferno',
	'Magma',
	'Turbo',
	'Cool',
	'Warm',
	'CubehelixDefault',
	'Rainbow',
	'Sinebow',
]

let centerForce: Ref<number> = ref(0)
let chargeForce: Ref<number> = ref(-100)
let linkForce: Ref<number> = ref(0)
let linkDistance: Ref<number> = ref(100)

let nodeColor: Ref<string> = ref('D3')
let selectedD3Color: Ref<number> = ref(colorSchemes.findIndex(scheme => scheme === 'Turbo'))

interface SettingViewEmits {
  (event: 'resetGraph'): void
	(event: 'updateGraph', value: SettingsOptions): void
}

const emit = defineEmits<SettingViewEmits>()

const updateGraph = () => {
	emit('updateGraph', {
		centerForce: centerForce.value,
		chargeForce: chargeForce.value,
		linkForce: linkForce.value,
		linkDistance: linkDistance.value,
		useRandomColor: nodeColor.value === 'Random',
		d3Color: colorSchemes[selectedD3Color.value]
	})
}
</script>
