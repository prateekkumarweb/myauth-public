<template>
  <nav class="border-b shadow p-4 flex justify-between">
    <div class="flex items-center">
      <h1 class="font-bold">MyAuth</h1>
    </div>
    <ul class="flex gap-2">
      <li>
        <button class="btn-primary" @click="openExportModal">Export</button>
      </li>
      <li>
        <button class="btn-primary" @click="openImportModal">Import</button>
      </li>
      <li v-if="!signedInUser">
        <button class="btn-primary" @click="openSignInDialog">Sign in</button>
      </li>
      <li v-if="signedInUser">
        <button class="btn-primary" @click="signOutUser">Sign out</button>
      </li>
    </ul>
  </nav>

  <app-dialog
    :title="'Sign in'"
    :is-open="isSignInDialogOpen"
    @setIsOpen="setSignInDialogOpen"
  >
    <div class="mt-2 text-gray-700">
      <form class="flex flex-col gap-3" @submit.prevent="signInUser">
        <label class="block">
          <span>Email</span>
          <input v-model="signInEmail" type="text" class="mt-1 block w-full" />
        </label>
        <label class="block">
          <span>Password</span>
          <input
            v-model="signInPassword"
            type="password"
            class="mt-1 block w-full"
          />
        </label>
        <p v-if="signInError" class="text-red-700">{{ signInError }}</p>
        <div>
          <button type="submit" class="btn-primary">Sign in</button>
          <button
            type="button"
            class="btn-error ml-2"
            @click="closeSignInDialog"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </app-dialog>

  <app-dialog
    :title="showImportView ? 'Import' : 'Export'"
    :is-open="isOpen"
    @setIsOpen="setIsOpen"
  >
    <div v-if="exportedKeys === ''">
      <div
        v-if="!showImportView"
        class="mt-2 text-gray-700 flex flex-col gap-3"
      >
        <label class="block">
          <span>Enter a password to encrypt:</span>
          <input
            v-model="password"
            type="password"
            class="mt-1 block w-full"
            placeholder="********"
          />
        </label>
      </div>

      <div v-if="showImportView" class="mt-2 text-gray-700 flex flex-col gap-3">
        <label class="block">
          <span>Enter the encryped text:</span>
          <textarea
            v-model="encrypted"
            class="mt-1 block w-full h-64"
            placeholder="Encrypted text"
          ></textarea>
        </label>
        <label class="block">
          <span>Enter the password to decrypt:</span>
          <input
            v-model="password"
            type="password"
            class="mt-1 block w-full"
            placeholder="********"
          />
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
          class="btn-primary"
          @click="showImportView ? importKeys() : exportKeys()"
        >
          {{ showImportView ? "Import" : "Export" }}
        </button>
        <button type="button" class="btn-error" @click="closeModal">
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
      <button type="button" class="btn-error" @click="closeModal">Close</button>
    </div>
  </app-dialog>
</template>

<script lang="ts">
import { getAuth, signInWithEmailAndPassword, signOut } from "@firebase/auth";
import { computed, defineComponent, ref } from "vue";
import { decrypt, encrypt } from "../crypt";
import { OtpAuthParam, useStore } from "../store";
import AppDialog from "./AppDialog.vue";

export default defineComponent({
  components: { AppDialog },
  setup() {
    const store = useStore();

    const signedInUser = computed(() => store.user);
    const isSignInDialogOpen = ref(false);
    const signInEmail = ref("");
    const signInPassword = ref("");
    const signInError = ref("");

    const setSignInDialogOpen = (value: boolean) => {
      isSignInDialogOpen.value = value;
    };
    const openSignInDialog = () => {
      isSignInDialogOpen.value = true;
    };
    const closeSignInDialog = () => {
      isSignInDialogOpen.value = false;
      signInError.value = "";
      signInPassword.value = "";
    };

    const signInUser = async () => {
      if (!signInEmail.value || !signInPassword.value) {
        signInError.value = "Email and password are required";
        return;
      }
      const auth = getAuth();
      try {
        await signInWithEmailAndPassword(
          auth,
          signInEmail.value,
          signInPassword.value
        );
        closeSignInDialog();
      } catch (e) {
        console.error("Sign in error: ", e);
        signInError.value = "Invalid credentials";
      }
    };

    const signOutUser = async () => {
      const auth = getAuth();
      try {
        await signOut(auth);
      } catch (e) {
        console.error("Sign out error: ", e);
      }
    };

    const signInExports = {
      isSignInDialogOpen,
      signInEmail,
      signInPassword,
      signInError,
      setSignInDialogOpen,
      openSignInDialog,
      closeSignInDialog,
      signInUser,
      signedInUser,
      signOutUser,
    };

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
    }

    return {
      ...signInExports,
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
    };
  },
});
</script>
