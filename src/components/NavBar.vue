<template>
  <nav class="border-b shadow p-4 flex justify-between">
    <div class="flex items-center">
      <h1 class="font-bold">MyAuth</h1>
      <div class="text-xs btnx-primary ml-2 p-[1px]">Alpha</div>
    </div>
    <ul class="flex gap-2">
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
</template>

<script setup lang="ts">
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  signOut,
} from "@firebase/auth";
import { computed } from "vue";
import { useStore } from "../store";

const store = useStore();

const signedInUser = computed(() => store.user);

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
