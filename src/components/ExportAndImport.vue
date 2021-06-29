<template>
  <div class="flex gap-2 justify-end">
    <button class="btnx-primary" @click="openExportModal">Export</button>
    <button class="btnx-primary" @click="openImportModal">Import</button>
  </div>

  <app-dialog
    :title="showImportView ? 'Import' : 'Export'"
    :is-open="isOpen"
    @setIsOpen="setIsOpen"
  >
    <div v-if="exportedKeys === ''">
      <div v-if="showImportView" class="mt-2">
        <button type="button" class="btnx-primary" @click="importFromFirestore">
          Get encrypted text from sync
        </button>

        <p v-if="syncSuccess" class="text-green-700 mt-2">{{ syncSuccess }}</p>

        <p v-if="syncError" class="text-red-700 mt-2">{{ syncError }}</p>
      </div>
      <div
        v-if="!showImportView"
        class="mt-2 text-gray-700 flex flex-col gap-3"
      >
        <label class="block">
          <span>Enter a password to encrypt:</span>
          <input v-model="password" type="password" class="mt-1 block w-full" />
        </label>
      </div>

      <div v-if="showImportView" class="mt-2 text-gray-700 flex flex-col gap-3">
        <label class="block">
          <span>Enter the encryped text:</span>
          <textarea
            v-model="encrypted"
            class="mt-1 block w-full h-64"
          ></textarea>
        </label>
        <label class="block">
          <span>Enter the password to decrypt:</span>
          <input v-model="password" type="password" class="mt-1 block w-full" />
        </label>
        <label class="block">
          <input v-model="keepExisting" type="checkbox" class="" />
          <span class="ml-2">Keep existing accounts</span>
        </label>
      </div>

      <p class="text-red-700 mt-4">{{ errorString }}</p>

      <div class="mt-4 flex gap-2">
        <button
          type="button"
          class="btnx-primary"
          @click="showImportView ? importKeys() : exportKeys()"
        >
          {{ showImportView ? "Import" : "Export" }}
        </button>
        <button type="button" class="btnx-error" @click="closeModal">
          Cancel
        </button>
      </div>
    </div>

    <div v-if="exportedKeys" class="mt-4">
      Copy the below encrypted text and save it
      <textarea
        v-model="exportedKeys"
        class="w-full border border-gray-400 text-gray-700 h-64 mt-2"
        disabled
      ></textarea>

      <p v-if="syncError" class="text-red-700">{{ syncError }}</p>

      <p v-if="syncSuccess" class="text-green-700">{{ syncSuccess }}</p>

      <div class="mt-2">
        <button
          type="button"
          class="btnx-primary mr-2"
          @click="syncWithFirestore"
        >
          Sync
        </button>
        <button type="button" class="btnx-error" @click="closeModal">
          Close
        </button>
      </div>
    </div>
  </app-dialog>
</template>

<script lang="ts">
import { doc, getDoc, getFirestore, setDoc } from "@firebase/firestore";
import { defineComponent, ref } from "vue";
import { decrypt, encrypt } from "../crypt";
import { OtpAuthParam, useStore } from "../store";
import AppDialog from "./AppDialog.vue";

export default defineComponent({
  components: { AppDialog },
  setup() {
    const store = useStore();

    const isOpen = ref(false);
    const showImportView = ref(false);

    const errorString = ref("");
    const encrypted = ref("");
    const password = ref("");
    const exportedKeys = ref("");
    const keepExisting = ref(false);

    function closeModal() {
      isOpen.value = false;
      password.value = "";
      encrypted.value = "";
      errorString.value = "";
      exportedKeys.value = "";
      keepExisting.value = false;
      syncError.value = "";
      syncSuccess.value = "";
    }

    const syncError = ref("");
    const syncSuccess = ref("");

    return {
      isOpen,
      showImportView,
      setIsOpen(value: boolean) {
        isOpen.value = value;
        if (!value) {
          password.value = "";
          errorString.value = "";
        }
      },
      openExportModal() {
        isOpen.value = true;
        showImportView.value = false;
      },
      openImportModal() {
        isOpen.value = true;
        showImportView.value = true;
      },
      closeModal,
      errorString,
      password,
      keepExisting,
      encrypted,
      exportedKeys,
      async exportKeys() {
        if (password.value.length < 8) {
          errorString.value = "Password should be at least 8 chars long";
        } else {
          errorString.value = "";
          const message = JSON.stringify({
            version: "1",
            params: store.otpAuthParams,
          });
          const encrypted = await encrypt(message, password.value);
          exportedKeys.value = encrypted;
        }
      },
      async importKeys() {
        try {
          errorString.value = "";
          const decrypted = await decrypt(
            encrypted.value.trim(),
            password.value
          );
          const imported = JSON.parse(decrypted) as {
            params: OtpAuthParam[];
            version: string;
          };
          store.importParams(imported.params, keepExisting.value);
          closeModal();
        } catch (e) {
          if (e.name === "OperationError") {
            errorString.value =
              "Decryption failed. Ensure that the password is correct and the encrypted text is not corrupted";
          } else {
            console.error(e);
          }
        }
      },
      syncError,
      syncSuccess,
      async syncWithFirestore() {
        const user = store.user;
        if (user) {
          try {
            syncError.value = "";
            syncSuccess.value = "";
            const data = {
              user: user.uid,
              exported: exportedKeys.value,
              lastSyncedAt: Date.now(),
            };
            const db = getFirestore();
            await setDoc(doc(db, "user_exports", user.uid), data);
            syncSuccess.value = "Sync successful";
          } catch (e) {
            syncError.value = e.message;
            console.error(e); // TODO Show sync error
          }
        }
      },
      async importFromFirestore() {
        const user = store.user;
        if (user) {
          if (user) {
            try {
              syncError.value = "";
              syncSuccess.value = "";
              const db = getFirestore();
              const dataDoc = await getDoc(doc(db, "user_exports", user.uid));
              encrypted.value = dataDoc.data()?.exported ?? "";
              syncSuccess.value = "Sync successful";
            } catch (e) {
              syncError.value = e.message;
              console.error(e);
            }
          }
        }
      },
    };
  },
});
</script>
