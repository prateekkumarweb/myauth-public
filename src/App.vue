<template>
  <nav-bar></nav-bar>

  <div class="m-4 gap-2 flex flex-col">
    <export-and-import></export-and-import>
    <div><!-- Exmpty div for gap --></div>

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

  <reload-prompt />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import AddAccount from "./components/AddAccount.vue";
import ExportAndImport from "./components/ExportAndImport.vue";
import NavBar from "./components/NavBar.vue";
import OtpCard from "./components/OtpCard.vue";
import ReloadPrompt from "./components/ReloadPrompt.vue";
import { setAuthObserver } from "./firebase";
import { OtpAuthParam, useStore } from "./store";
import { otpAuthUriParser } from "./totp";

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

    const otpAuthUris = [
      "otpauth://totp/Google:bob@google.com?secret=AAAABBBBCCCCXXXXYYYYZZZZ22227777&issuer=Google",
      "otpauth://totp/Example:alice@google.com?secret=JBSWY3DPEHPK3PXP&issuer=Example",
      "otpauth://totp/Google:charles@google.com?secret=ABCDEFGH&issuer=Google",
    ];

    const store = useStore();

    for (const param of otpAuthUris.map((uri) => otpAuthUriParser(uri))) {
      if (param) store.addParam(param);
    }

    return {
      params: store.otpAuthParams,
      addParam(value: OtpAuthParam) {
        store.addParam(value);
      },
      deleteAccount(index: number) {
        store.deleteParam(index);
      },
    };
  },
});
</script>
