<template>
  <div v-if="!params && synced" class="flex flex-col gap-2">
    <p>
      The totp keys are encrypted. Enter your master password to decrypt the
      keys.
    </p>
    <div class="ma-inline-form">
      <input
        v-model="masterPassword"
        type="password"
        placeholder="Enter master password"
      />
      <button class="btnx-primary" @click="decryptSyncedData">
        Decrypt your data
      </button>
      <p v-if="decryptSyncedDataError" class="text-red-700">
        {{ decryptSyncedDataError }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useStore } from "../store";

const store = useStore();

const params = computed(() => store.otpAuthParams);
const synced = computed(() => store.syncedData);

const masterPassword = ref("");
const decryptSyncedDataError = ref("");

async function decryptSyncedData() {
  decryptSyncedDataError.value = "";
  const user = store.user;
  if (user) {
    decryptSyncedDataError.value = "";
    try {
      await store.decryptAndLoadParams(masterPassword.value);
    } catch (e) {
      if (e.name === "OperationError") {
        decryptSyncedDataError.value =
          "Decryption failed. Ensure that the entered password is correct.";
      } else {
        console.error(e);
      }
    }
  } else {
    decryptSyncedDataError.value =
      "Your need to be signed in to decrypt your data";
  }
}
</script>
