<template>
  <table class="w-full table-auto">
    <thead class="bg-zinc-700">
      <tr class="py-1">
        <th class="text-start pl-2">
          Language
        </th>
        <th class="text-start">
          Extension
        </th>
        <th class="text-start">
          Files
        </th>
        <th class="text-start">
          Lines
        </th>
        <th class="text-start">
          Color
        </th>
        <th class="text-start">
          Remove
        </th>
      </tr>
    </thead>
    <tbody>
      <tr class="bg-zinc-800 border border-zinc-700">
        <td class="pl-2">
          TypeScript
        </td>
        <td>.ts</td>
        <td>10</td>
        <td>100</td>
        <td>
          <div class="w-4 h-4 bg-blue-500 rounded-full border border-white cursor-pointer" />
        </td>
        <td>
          <button class="text-red-500 bg-transparent hover:background-white w-4 h-4 rounded-full">
            <CloseIcon class="w-4 h-4" />
          </button>
        </td>
      </tr>
      <tr class="bg-zinc-800 border border-zinc-700">
        <td class="pl-2">
          JavaScript
        </td>
        <td>.js</td>
        <td>3</td>
        <td>24</td>
        <td>
          <div class="w-4 h-4 bg-blue-500 rounded-full border border-white cursor-pointer" />
        </td>
        <td>
          <button class="text-red-500 bg-transparent hover:background-white w-4 h-4 rounded-full">
            <CloseIcon class="w-4 h-4" />
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import CloseIcon from '~icons/mdi/close-circle'
</script>
