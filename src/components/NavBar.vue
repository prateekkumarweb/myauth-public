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
import { decrypt, encrypt } from "../crypt";

export default defineComponent({
  setup() {
    const store = useStore();

    async function exportKeys() {
      const message = JSON.stringify({
        version: 1,
        params: store.otpAuthParams,
      });
      console.log(message);
      const password = prompt("Enter password to encrypt");
      const encrypted = await encrypt(message, password ?? "");
      console.log(encrypted);
      const decrypted = await decrypt(encrypted, password ?? "");
      console.log(decrypted);
    }

    return { exportKeys };
  },
});
</script>
