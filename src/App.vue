<template>
  <nav-bar></nav-bar>
  <div class="m-4 gap-2 flex flex-col">
    <template v-for="item in otpauthParams" :key="item">
      <otp-card
        v-if="item"
        :secret="item.secret"
        :issuer="item.issuer"
        :name="item.name"
      ></otp-card
    ></template>
  </div>

  <add-account @addAccount="addAccount"></add-account>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import NavBar from "./components/NavBar.vue";
import OtpCard from "./components/OtpCard.vue";
import AddAccount from "./components/AddAccount.vue";
import { otpauthUriParser } from "./totp";

export default defineComponent({
  name: "App",
  components: {
    NavBar,
    OtpCard,
    AddAccount,
  },
  setup() {
    const otpauthUris = [
      "otpauth://totp/Google:bob@google.com?secret=AAAABBBBCCCCXXXXYYYYZZZZ22227777&issuer=Google",
      "otpauth://totp/Example:alice@google.com?secret=JBSWY3DPEHPK3PXP&issuer=Example",
      "otpauth://totp/Google:charles@google.com?secret=ABCDEFGH&issuer=Google",
    ];
    const otpauthParams = reactive(
      otpauthUris.map((uri) => otpauthUriParser(uri))
    );

    return {
      otpauthParams,
      addAccount(value: { name: string; issuer: string; secret: string }) {
        otpauthParams.push(value);
      },
    };
  },
});
</script>
