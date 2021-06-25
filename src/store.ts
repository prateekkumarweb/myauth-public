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
    importParams(params: OtpAuthParam[], keepExisting: boolean) {
      if (!keepExisting) {
        this.$state.otpAuthParams.length = 0;
      }
      params.forEach((param) => {
        if (
          this.$state.otpAuthParams.filter(
            (p) =>
              p.secret === param.secret &&
              p.issuer === param.issuer &&
              p.label === param.label
          ).length === 0
        ) {
          this.addParam(param);
        }
      });
    },
    deleteParam(index: number) {
      this.otpAuthParams.splice(index, 1);
    },
  },
});
