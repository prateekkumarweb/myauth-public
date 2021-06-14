<template>
  <nav class="border-b shadow p-4 flex justify-between">
    <div class="flex items-center">
      <h1 class="font-bold">MyAuth</h1>
    </div>
    <ul>
      <li>
        <button class="btn-primary" @click="exportKeys">Export</button>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "../store";

export default defineComponent({
  setup() {
    const store = useStore();

    function exportKeys() {
      console.log(JSON.stringify({ version: 1, params: store.otpAuthParams }));
    }

    return { exportKeys };
  },
});
</script>
