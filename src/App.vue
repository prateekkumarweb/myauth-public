<template>
  <div
    v-if="loading"
    class="absolute h-full w-full bg-white flex items-center justify-center"
  >
    Loading ...
  </div>

  <nav-bar></nav-bar>

  <div v-if="user" class="m-4 flex flex-col gap-2">
    <create-master-password />

    <decrypt-synced-data />

    <display-totps />
  </div>

  <div v-if="!user" class="m-4">You need to sign in to use this app.</div>

  <reload-prompt />
</template>

<script setup lang="ts">
import { computed } from "vue";
import CreateMasterPassword from "./components/CreateMasterPassword.vue";
import DecryptSyncedData from "./components/DecryptSyncedData.vue";
import DisplayTotps from "./components/DisplayTotps.vue";
import NavBar from "./components/NavBar.vue";
import ReloadPrompt from "./components/ReloadPrompt.vue";
import { setAuthObserver } from "./firebase";
import { useStore } from "./store";

setAuthObserver();

const store = useStore();

const user = computed(() => store.user);
const loading = computed(() => store.loading);
</script>
