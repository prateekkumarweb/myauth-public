<template>
  <div class="fixed bottom-0 right-0 m-4">
    <button
      type="button"
      class="border-1 shadow rounded-full p-2 text-green-800 bg-green-200"
      aria-label="Add"
      @click="openModal()"
    >
      <plus-icon class="h-10 w-10"></plus-icon>
    </button>
  </div>

  <app-dialog
    :title="!showScanner ? 'Enter manually' : 'Scan QR'"
    :show-top-button="true"
    :top-button-text="showScanner ? 'Enter manually' : 'Scan QR'"
    :is-open="isOpen"
    @topButtonClicked="showScanner = !showScanner"
    @setIsOpen="setIsOpen"
  >
    <div v-if="showScanner">
      <qr-code-scanner class="mt-2" @qrCodeScan="qrCodeScan"></qr-code-scanner>
    </div>

    <div v-if="!showScanner">
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
        <button type="button" class="btn-primary" @click="addAndClose">
          Add
        </button>
        <button type="button" class="btn-error" @click="closeModal">
          Cancel
        </button>
      </div>
    </div>
  </app-dialog>
</template>

<script lang="ts">
import { QRCode } from "jsqr";
import { defineComponent, ref } from "vue";
import { otpAuthUriParser } from "../totp";
import AppDialog from "./AppDialog.vue";
import PlusIcon from "./icons/PlusIcon.vue";
import QrCodeScanner from "./QrCodeScanner.vue";

export default defineComponent({
  components: {
    PlusIcon,
    QrCodeScanner,
    AppDialog,
  },
  emits: ["addParam"],

  setup(props, { emit }) {
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

    return {
      isOpen,
      closeModal,
      addAndClose() {
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
      },
      openModal() {
        isOpen.value = true;
      },
      setIsOpen(value: boolean) {
        isOpen.value = value;
      },
      label,
      issuer,
      secret,
      errorString,
      showScanner,
      qrCodeScan(code: QRCode) {
        const otpAuthUri = code.data;
        const otpAuthParam = otpAuthUriParser(otpAuthUri);
        if (otpAuthParam) {
          label.value = otpAuthParam.label;
          issuer.value = otpAuthParam.issuer;
          secret.value = otpAuthParam.secret;
          showScanner.value = false;
        }

        console.log(code);
        showScanner.value = false;
      },
    };
  },
});
</script>
