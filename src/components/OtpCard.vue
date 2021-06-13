<template>
  <div class="flex border rounded p-2 gap-2 items-center">
    <img class="h-16 rounded-full border" src="../assets/logo.png" alt="Logo" />
    <div>
      <div>Google (test@gmail.com)</div>
      <div class="text-2xl">{{ otpPart1 }} {{ otpPart2 }}</div>
    </div>
    <div class="flex-grow"></div>
    <div class="text-4xl font-extralight">{{ timeRemaining }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted, ref } from "vue";
import { getTotp } from "../totp";

export default defineComponent({
  props: {
    totpKey: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const otpPart1 = ref("123");
    const otpPart2 = ref("456");
    const timeRemaining = ref(15);

    const otpInterval = setInterval(() => {
      getTotp(props.totpKey).then((totp) => {
        const otp = totp.otp.toString().padStart(6, "0");
        otpPart1.value = otp.slice(0, 3);
        otpPart2.value = otp.slice(3, 6);
        timeRemaining.value = Math.trunc(totp.timeRemaining);
      });
    }, 500);

    onUnmounted(() => {
      clearInterval(otpInterval);
    });

    return { otpPart1, otpPart2, timeRemaining };
  },
});
</script>
