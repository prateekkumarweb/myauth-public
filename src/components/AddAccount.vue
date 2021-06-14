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
            class="text-lg font-medium leading-6 text-gray-900"
          >
            Add new account
          </DialogTitle>

          <div class="mt-2 text-gray-700 flex flex-col gap-3">
            <label class="block">
              <span>Name</span>
              <input
                v-model="name"
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
  </Dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { Dialog, DialogOverlay, DialogTitle } from "@headlessui/vue";
import PlusIcon from "./icons/PlusIcon.vue";

export default defineComponent({
  components: {
    Dialog,
    DialogOverlay,
    DialogTitle,
    PlusIcon,
  },
  emits: ["addParam"],

  setup(props, { emit }) {
    const isOpen = ref(false);

    const name = ref("");
    const issuer = ref("");
    const secret = ref("");
    const errorString = ref("");

    function closeModal() {
      isOpen.value = false;
      errorString.value = "";
      name.value = "";
      issuer.value = "";
      secret.value = "";
    }

    return {
      isOpen,
      closeModal,
      addAndClose() {
        if (name.value && issuer.value && secret.value) {
          emit("addParam", {
            name: name.value,
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
      name,
      issuer,
      secret,
      errorString,
    };
  },
});
</script>
