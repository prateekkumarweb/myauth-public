<template>
  <div class="flex border rounded p-2 gap-2 items-center">
    <div
      class="
        h-16
        w-16
        rounded-full
        border
        bg-green-600
        text-white text-4xl
        flex
        justify-center
        items-center
      "
    >
      <div class="font-bold">{{ issuer.charAt(0) }}</div>
    </div>
    <div>
      <div>{{ issuer }} ({{ name }})</div>
      <div class="text-2xl">{{ otpPart1 }} {{ otpPart2 }}</div>
    </div>
    <div class="flex-grow"></div>
    <div class="text-4xl font-extralight text-gray-400">
      {{ timeRemaining }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted, ref } from "vue";
import { getTotp } from "../totp";

export default defineComponent({
  props: {
    secret: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    issuer: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const otpPart1 = ref("___");
    const otpPart2 = ref("___");
    const timeRemaining = ref(15);

    const otpInterval = setInterval(() => {
      getTotp(props.secret).then((totp) => {
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
