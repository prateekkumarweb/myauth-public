<template>
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
            <div>{{ title }}</div>

            <button
              v-if="showTopButton"
              class="btn-primary"
              @click="topButtonClicked"
            >
              {{ topButtonText }}
            </button>
          </DialogTitle>

          <slot></slot>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Dialog, DialogOverlay, DialogTitle } from "@headlessui/vue";

export default defineComponent({
  components: {
    Dialog,
    DialogOverlay,
    DialogTitle,
  },
  props: {
    title: { type: String, required: true },
    showTopButton: { type: Boolean, default: false },
    topButtonText: { type: String, default: "" },
    isOpen: { type: Boolean, required: true },
  },
  emits: ["topButtonClicked", "setIsOpen"],
  setup(props, { emit }) {
    return {
      setIsOpen(value: boolean) {
        emit("setIsOpen", value);
      },
      topButtonClicked() {
        emit("topButtonClicked");
      },
    };
  },
});
</script>
