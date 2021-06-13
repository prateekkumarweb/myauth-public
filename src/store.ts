import { defineStore } from "pinia";

export interface OtpAuthParam {
  name: string;
  issuer: string;
  secret: string;
}

interface AppState {
  otpAuthParams: OtpAuthParam[];
}

export const useStore = defineStore({
  id: "myAuthStore",
  state(): AppState {
    return { otpAuthParams: [] };
  },
  getters: {
    params(state) {
      return state.otpAuthParams;
    },
  },
  actions: {
    addParam(param: OtpAuthParam) {
      this.otpAuthParams.push(param);
    },
    deleteParam(index: number) {
      this.otpAuthParams.splice(index, 1);
    },
  },
});