<template>
  <nav-bar></nav-bar>
  <div class="m-4">
    <otp-card :totp-key="'aaaa bbbb cccc xxxx yyyy zzzz 2222 7777'"></otp-card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import NavBar from "./components/NavBar.vue";
import OtpCard from "./components/OtpCard.vue";

export default defineComponent({
  name: "App",
  components: {
    NavBar,
    OtpCard,
  },
});
</script>
