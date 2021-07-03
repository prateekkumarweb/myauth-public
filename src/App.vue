<template>
  <div
    v-if="loading"
    class="absolute h-full w-full bg-white flex items-center justify-center"
  >
    Loading ...
  </div>

  <nav-bar></nav-bar>

  <div v-if="user">
    <div class="m-4 gap-2 flex flex-col">
      <export-and-import></export-and-import>
      <div><!-- Exmpty div for gap --></div>
      <div v-if="params.length == 0">
        There are no saved accounts. Import your accounts if you have previously
        synced.
      </div>
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

  <div v-if="!user" class="m-4">You need to sign in to use this app.</div>

  <reload-prompt />
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import AddAccount from "./components/AddAccount.vue";
import ExportAndImport from "./components/ExportAndImport.vue";
import NavBar from "./components/NavBar.vue";
import OtpCard from "./components/OtpCard.vue";
import ReloadPrompt from "./components/ReloadPrompt.vue";
import { setAuthObserver } from "./firebase";
import { OtpAuthParam, useStore } from "./store";

export default defineComponent({
  name: "App",
  components: {
    NavBar,
    OtpCard,
    AddAccount,
    ReloadPrompt,
    ExportAndImport,
  },
  setup() {
    setAuthObserver();

    const store = useStore();

    return {
      params: store.otpAuthParams,
      addParam(value: OtpAuthParam) {
        store.addParam(value);
      },
      deleteAccount(index: number) {
        store.deleteParam(index);
      },
      user: computed(() => store.user),
      loading: computed(() => store.loading),
    };
  },
});
</script>
