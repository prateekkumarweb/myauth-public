<template>
  <div v-if="firstTimeUser" class="flex flex-col gap-2">
    <p>
      Before you can use this app, you have to create a master password that
      will be used to encrypt your data. Note that if you forget the master
      password, you will not be able to retrieve back the data.
    </p>
    <div class="ma-inline-form">
      <input
        v-model="masterPassword"
        type="password"
        placeholder="Enter new master password"
      />
      <button class="btnx-primary" @click="createMasterPassword">
        Create master password
      </button>
      <p v-if="createMasterPasswordError" class="text-red-700">
        {{ createMasterPasswordError }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { computed, ref } from "vue";
import { encrypt } from "../crypt";
import { useStore } from "../store";

const store = useStore();

const firstTimeUser = computed(
  () => store.user !== null && store.syncedData === null
);

const masterPassword = ref("");
const createMasterPasswordError = ref("");

async function createMasterPassword() {
  // const store = useStore();
  createMasterPasswordError.value = "";
  if (masterPassword.value.length < 8) {
    createMasterPasswordError.value =
      "Password should be at least 8 chars long";
  } else {
    createMasterPasswordError.value = "";
    const message = JSON.stringify({
      version: "1",
      params: [],
    });
    const encrypted = await encrypt(message, masterPassword.value);

    const user = store.user;
    if (user) {
      try {
        createMasterPasswordError.value = "";
        const data = {
          user: user.uid,
          exported: encrypted,
          lastSyncedAt: Date.now(),
        };
        const db = getFirestore();
        await setDoc(doc(db, "user_exports", user.uid), data);
        await store.loadInitialData();
        await store.decryptAndLoadParams(masterPassword.value);
      } catch (e) {
        createMasterPasswordError.value = e.message;
        console.error(e);
      }
    } else {
      createMasterPasswordError.value =
        "You need to be signed in to create a master password";
    }
  }
}
</script>
