<template>
  <div class="border rounded-md p-4">
    <div class="text-gray-700">{{ errorMessage }}</div>
    <video ref="camera" :width="500" :height="500" autoplay></video>
  </div>
</template>

<script setup lang="ts">
import type { Ref } from "vue";
import { onBeforeUnmount, onMounted, ref } from "vue";

// eslint-disable-next-line no-undef
const emit = defineEmits(["qrCodeScan"]);

const camera: Ref<HTMLVideoElement | null> = ref(null);
const errorMessage = ref("");

async function getMedia() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: {
          ideal: "environment",
        },
      },
    });

    errorMessage.value = "";
    if (camera.value) camera.value.srcObject = stream;
  } catch (err) {
    errorMessage.value =
      "Camera permission denied. Enable camera to scan qr code.";
  }
}

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

async function tick() {
  if (camera.value) {
    const canvas = document.createElement("canvas");
    canvas.height = camera.value.height;
    canvas.width = camera.value.width;
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }
    context.drawImage(camera.value, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    const jsQR = (await import("jsqr")).default;
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
</script>
