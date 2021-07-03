<template>
  <div v-if="params">
    <div class="flex flex-col gap-2">
      <details>
        <summary>Sync your changes</summary>
        <div v-if="isInSync">Your data is synced with the server.</div>
        <div v-if="!isInSync" class="ma-inline-form">
          <input
            v-model="masterPassword"
            type="password"
            placeholder="Enter master password"
          />
          <button class="btnx-primary" @click="syncChanges">
            Sync your changes
          </button>
          <p v-if="syncChangesError" class="text-red-700">
            {{ syncChangesError }}
          </p>
        </div>
      </details>

      <div class="flex gap-2"></div>

      <div v-if="params.length == 0">There are no saved accounts.</div>
      <template v-for="(item, index) in params" :key="index">
        <otp-card
          v-if="item"
          :secret="item.secret"
          :issuer="item.issuer"
          :label="item.label"
          @deleteAccount="deleteAccount(index)"
        ></otp-card>
      </template>
    </div>

    <add-account @addParam="addParam"></add-account>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "@vue/runtime-core";
import type { OtpAuthParam } from "../store";
import { useStore } from "../store";
import AddAccount from "./AddAccount.vue";
import OtpCard from "./OtpCard.vue";

const store = useStore();

const params = computed(() => store.otpAuthParams);
const isInSync = computed(() => store.isInSync);

function addParam(value: OtpAuthParam) {
  store.addParam(value);
}

function deleteAccount(index: number) {
  store.deleteParam(index);
}

const masterPassword = ref("");
const syncChangesError = ref("");

async function syncChanges() {
  syncChangesError.value = "";
  if (masterPassword.value.length < 8) {
    syncChangesError.value = "Password should be at least 8 chars long";
  } else {
    const user = store.user;
    if (user) {
      syncChangesError.value = "";
      try {
        await store.syncChanges(masterPassword.value);
        masterPassword.value = "";
      } catch (e) {
        syncChangesError.value = "Sync failed";
        console.error(e);
      }
    } else {
      syncChangesError.value = "Your need to be signed in to sync your changes";
    }
  }
}
</script>
