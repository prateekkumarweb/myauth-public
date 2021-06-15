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
      <div>{{ issuer }} ({{ label }})</div>
      <div class="text-2xl">{{ otpPart1 }} {{ otpPart2 }}</div>
    </div>
    <div class="flex-grow"></div>
    <div class="flex flex-col items-end">
      <div class="cursor-pointer text-red-300" @click="deleteAccount">
        <trash-icon class="h-6 w-6"></trash-icon>
      </div>
      <div class="text-4xl font-extralight text-gray-400">
        {{ timeRemaining }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted, ref } from "vue";
import { getTotp } from "../totp";
import TrashIcon from "./icons/TrashIcon.vue";

export default defineComponent({
  components: { TrashIcon },
  props: {
    secret: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    issuer: {
      type: String,
      required: true,
    },
  },
  emits: ["deleteAccount"],
  setup(props, { emit }) {
    const otpPart1 = ref("___");
    const otpPart2 = ref("___");
    const timeRemaining = ref(15);

    const otpInterval = setInterval(async () => {
      try {
        const totp = await getTotp(props.secret);
        const otp = totp.otp.toString().padStart(6, "0");
        otpPart1.value = otp.slice(0, 3);
        otpPart2.value = otp.slice(3, 6);
        timeRemaining.value = Math.trunc(totp.timeRemaining);
      } catch (e) {
        console.error(e);
        timeRemaining.value = 0;
        clearInterval(otpInterval);
      }
    }, 500);

    onUnmounted(() => {
      clearInterval(otpInterval);
    });

    return {
      otpPart1,
      otpPart2,
      timeRemaining,
      deleteAccount() {
        emit("deleteAccount");
      },
    };
  },
});
</script>
