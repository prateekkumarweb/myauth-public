<template>
  <div class="flex items-center justify-center">
    <button class="btnx-primary" @click="openModal()">Add account</button>
  </div>

  <div
    v-if="isOpen"
    class="absolute top-0 left-0 w-full h-full bg-white flex flex-col gap-2 p-4"
  >
    <div class="flex justify-between gap-2 items-center">
      <div>{{ !showScanner ? "Enter manually" : "Scan QR" }}</div>
      <div class="flex gap-2">
        <button class="btnx-primary" @click="showScanner = !showScanner">
          Enter manually
        </button>

        <button class="btnx-error" @click="closeModal">Close</button>
      </div>
    </div>

    <div v-if="showScanner" class="flex flex-col items-center">
      <qr-code-scanner class="mt-2" @qrCodeScan="qrCodeScan"></qr-code-scanner>
    </div>

    <div v-if="!showScanner" class="flex flex-col items-center">
      <div class="mt-2 text-gray-700 flex flex-col gap-3">
        <label class="block">
          <span>Label</span>
          <input
            v-model="label"
            type="text"
            class="mt-1 block w-full"
            placeholder="test@example.com"
          />
        </label>
        <label class="block">
          <span>Issuer</span>
          <input
            v-model="issuer"
            type="text"
            class="mt-1 block w-full"
            placeholder="Example"
          />
        </label>
        <label class="block">
          <span>Secret</span>
          <input
            v-model="secret"
            type="text"
            class="mt-1 block w-full"
            placeholder="AAAABBBBCCCCDDDD"
          />
        </label>
      </div>

      <p class="text-red-700 mt-4">{{ errorString }}</p>

      <div class="mt-4 flex gap-2">
        <button type="button" class="btnx-primary" @click="addAndClose">
          Add
        </button>
        <button type="button" class="btnx-error" @click="closeModal">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { QRCode } from "jsqr";
import { ref } from "vue";
import { otpAuthUriParser } from "../totp";
import QrCodeScanner from "./QrCodeScanner.vue";

// eslint-disable-next-line no-undef
const emit = defineEmits(["addParam"]);

const isOpen = ref(false);

const label = ref("");
const issuer = ref("");
const secret = ref("");
const errorString = ref("");

function closeModal() {
  isOpen.value = false;
  errorString.value = "";
  label.value = "";
  issuer.value = "";
  secret.value = "";
}

const showScanner = ref(true);

function addAndClose() {
  if (label.value && issuer.value && secret.value) {
    emit("addParam", {
      label: label.value,
      issuer: issuer.value,
      secret: secret.value,
    });
    closeModal();
  } else {
    errorString.value = "All fields are required";
  }
}

function openModal() {
  isOpen.value = true;
}

function qrCodeScan(code: QRCode) {
  const otpAuthUri = code.data;
  const otpAuthParam = otpAuthUriParser(otpAuthUri);
  if (otpAuthParam) {
    label.value = otpAuthParam.label;
    issuer.value = otpAuthParam.issuer;
    secret.value = otpAuthParam.secret;
    showScanner.value = false;
  }
  showScanner.value = false;
}
</script>
