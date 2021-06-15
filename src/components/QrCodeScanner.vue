

<template>
  <div class="border rounded-md p-4">
    <div v-if="inputOptions.length" class="w-full mb-4">
      <Listbox v-model="selectedInputDevice">
        <div class="relative mt-1">
          <ListboxButton
            class="
              relative
              w-full
              py-2
              pl-3
              pr-10
              text-left
              bg-white
              rounded-lg
              shadow-md
              cursor-default
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-opacity-75
              focus-visible:ring-white
              focus-visible:ring-offset-orange-300
              focus-visible:ring-offset-2
              focus-visible:border-indigo-500
              sm:text-sm
            "
          >
            <span class="block truncate">{{ selectedInputDevice?.label }}</span>
            <span
              class="
                absolute
                inset-y-0
                right-0
                flex
                items-center
                pr-2
                pointer-events-none
              "
            >
              <SelectorIcon class="w-5 h-5 text-gray-400" aria-hidden="true" />
            </span>
          </ListboxButton>

          <transition
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <ListboxOptions
              class="
                absolute
                w-full
                py-1
                mt-1
                overflow-auto
                text-base
                bg-white
                rounded-md
                shadow-lg
                max-h-60
                ring-1 ring-black ring-opacity-5
                focus:outline-none
                sm:text-sm
              "
            >
              <ListboxOption
                v-for="device in inputOptions"
                v-slot="{ active, selected }"
                :key="device.deviceId"
                :value="device"
                as="template"
              >
                <li
                  :class="[
                    active ? 'text-amber-900 bg-amber-100' : 'text-gray-900',
                    'cursor-default select-none relative py-2 pl-10 pr-4',
                  ]"
                >
                  <span
                    :class="[
                      selected ? 'font-medium' : 'font-normal',
                      'block truncate',
                    ]"
                    >{{ device.label }}</span
                  >
                  <span
                    v-if="selected"
                    class="
                      absolute
                      inset-y-0
                      left-0
                      flex
                      items-center
                      pl-3
                      text-amber-600
                    "
                  >
                    <CheckIcon class="w-5 h-5" aria-hidden="true" />
                  </span>
                </li>
              </ListboxOption>
            </ListboxOptions>
          </transition>
        </div>
      </Listbox>
    </div>

    <div class="text-gray-700">{{ errorMessage }}</div>
    <video ref="camera" :width="500" :height="500" autoplay></video>
  </div>
</template>

<script lang="ts">
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/vue";
import jsQR from "jsqr";
import {
  defineComponent,
  onBeforeUnmount,
  onMounted,
  Ref,
  ref,
  watch,
} from "vue";
import CheckIcon from "./icons/CheckIcon.vue";
import SelectorIcon from "./icons/SelectorIcon.vue";

export default defineComponent({
  components: {
    Listbox,
    ListboxOptions,
    ListboxOption,
    ListboxButton,
    SelectorIcon,
    CheckIcon,
  },
  emits: ["qrCodeScan"],
  setup(props, { emit }) {
    const camera: Ref<HTMLVideoElement | null> = ref(null);
    const errorMessage = ref("");
    const inputOptions: Ref<{ deviceId: string; label: string }[]> = ref([]);
    const selectedInputDevice: Ref<{ deviceId: string; label: string } | null> =
      ref(null);

    // eslint-disable-next-line no-undef
    let constraints: {
      audio: boolean;
      video: boolean;
      deviceId?: { exact?: string };
    } = { audio: false, video: true };

    async function getMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );
        inputOptions.value = videoDevices.map((device) => ({
          deviceId: device.deviceId,
          label: device.label,
        }));

        if (
          selectedInputDevice.value?.deviceId !==
          inputOptions.value[0]?.deviceId
        ) {
          selectedInputDevice.value = inputOptions.value[0];
        }

        errorMessage.value = "";
        if (camera.value) camera.value.srcObject = stream;
      } catch (err) {
        errorMessage.value =
          "Camera permission denied. Enable camera to scan qr code.";
      }
    }

    watch(selectedInputDevice, async (value) => {
      constraints = { ...constraints, deviceId: { exact: value?.deviceId } };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (camera.value) camera.value.srcObject = stream;
    });

    onMounted(async () => {
      await getMedia();
      requestAnimationFrame(tick);
    });

    onBeforeUnmount(async () => {
      const tracks = (camera.value?.srcObject as MediaStream)?.getTracks();
      tracks?.forEach((track) => {
        track.stop();
      });
    });

    function tick() {
      if (camera.value) {
        const canvas = document.createElement("canvas");
        canvas.height = camera.value.height;
        canvas.width = camera.value.width;
        const context = canvas.getContext("2d");
        if (!context) {
          return;
        }
        context.drawImage(camera.value, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );

        const code = jsQR(imageData.data, canvas.width, canvas.height, {
          inversionAttempts: "attemptBoth",
        });
        if (code && code.data.length > 0) {
          emit("qrCodeScan", code);
        } else {
          requestAnimationFrame(tick);
        }
      }
    }

    return {
      camera,
      errorMessage,
      inputOptions,
      selectedInputDevice,
    };
  },
});
</script>
