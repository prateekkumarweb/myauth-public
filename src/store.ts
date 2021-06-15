import { defineStore } from "pinia";

export interface OtpAuthParam {
  label: string;
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
  actions: {
    addParam(param: OtpAuthParam) {
      this.otpAuthParams.push(param);
    },
    deleteParam(index: number) {
      this.otpAuthParams.splice(index, 1);
    },
  },
});
