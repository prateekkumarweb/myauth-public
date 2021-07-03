<template>
  <nav class="border-b shadow p-4 flex justify-between">
    <div class="flex items-center">
      <h1 class="font-bold">MyAuth</h1>
      <div class="text-xs btnx-primary ml-2 p-[1px]">Alpha</div>
    </div>
    <ul class="flex gap-2">
      <li v-if="!signedInUser">
        <button class="btnx-primary" @click="openSignInDialog">Sign in</button>
      </li>
      <li v-if="signedInUser">
        <button class="btnx-primary" @click="signOutUser">Sign out</button>
      </li>
      <li v-if="!signedInUser">
        <button class="btnx-primary" @click="signInWithGoogle">
          Sign in with Google
        </button>
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
          <button type="submit" class="btnx-primary">Sign in</button>
          <button
            type="button"
            class="btnx-error ml-2"
            @click="closeSignInDialog"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </app-dialog>
</template>

<script setup lang="ts">
import {
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signOut,
} from "@firebase/auth";
import { computed, ref } from "vue";
import { useStore } from "../store";
import AppDialog from "./AppDialog.vue";

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

function signInWithGoogle() {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  signInWithRedirect(auth, provider);
}
</script>
