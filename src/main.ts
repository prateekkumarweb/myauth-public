import { createPinia } from "pinia";
import { createApp } from "vue";
import App from "./App.vue";
import "./firebase";
import "./index.css";

if (import.meta.env.PROD) {
  if (window.location.host !== "myauth.prateekkumar.in") {
    window.location.replace("https://myauth.prateekkumar.in");
  }
}

createApp(App).use(createPinia()).mount("#app");
