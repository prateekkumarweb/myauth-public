<template>
  <div class="fixed bottom-0 right-0 m-4">
    <button
      type="button"
      class="border-1 shadow rounded-full p-2 text-green-800 bg-green-200"
      @click="openModal()"
    >
      <plus-icon class="h-10 w-10"></plus-icon>
    </button>
  </div>

  <Dialog as="div" :open="isOpen" @close="setIsOpen">
    <div class="fixed inset-0 z-10 overflow-y-auto">
      <div class="min-h-screen px-4 text-center">
        <DialogOverlay class="fixed inset-0 bg-black opacity-30" />

        <span class="inline-block h-screen align-middle" aria-hidden="true">
          &#8203;
        </span>

        <div
          class="
            inline-block
            w-full
            max-w-md
            p-6
            my-8
            overflow-hidden
            text-left
            align-middle
            transition-all
            transform
            bg-white
            shadow-xl
            rounded-2xl
          "
        >
          <DialogTitle
            as="h3"
            class="
              text-lg
              font-medium
              leading-6
              text-gray-900
              flex
              justify-between
              items-center
            "
          >
            <div>{{ !showScanner ? "Enter manually" : "Scan QR" }}</div>

            <button class="btn-primary" @click="showScanner = !showScanner">
              {{ showScanner ? "Enter manually" : "Scan QR" }}
            </button>
          </DialogTitle>

          <div v-if="showScanner">
            <qr-code-scanner
              class="mt-2"
              @qrCodeScan="qrCodeScan"
            ></qr-code-scanner>
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
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script lang="ts">
import { Dialog, DialogOverlay, DialogTitle } from "@headlessui/vue";
import { QRCode } from "jsqr";
import { defineComponent, ref } from "vue";
import { otpAuthUriParser } from "../totp";
import PlusIcon from "./icons/PlusIcon.vue";
import QrCodeScanner from "./QrCodeScanner.vue";

export default defineComponent({
  components: {
    Dialog,
    DialogOverlay,
    DialogTitle,
    PlusIcon,
    QrCodeScanner,
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
