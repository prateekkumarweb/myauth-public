<template>
  <div class="text-center mt-8 antialiased text-gray-800 font-sans">
    <img alt="Vue logo" src="./assets/logo.png" class="inline-block" />
    <HelloWorld msg="Hello Vue 3 + TypeScript + Vite" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import HelloWorld from "./components/HelloWorld.vue";

export default defineComponent({
  name: "App",
  components: {
    HelloWorld,
  },
});
</script>
