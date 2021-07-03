import { User } from "firebase/auth";
import { defineStore } from "pinia";

export interface OtpAuthParam {
  label: string;
  issuer: string;
  secret: string;
}

export interface AuthUser {
  displayName: string | null;
  email: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  uid: string;
  providerId: string;
}

interface AppState {
  otpAuthParams: OtpAuthParam[];
  user: AuthUser | null | undefined; // undefined means data not loaded yet
  loading: boolean;
}

export const useStore = defineStore({
  id: "myAuthStore",
  state(): AppState {
    return { otpAuthParams: [], user: undefined, loading: false };
  },
  actions: {
    startLoading() {
      this.loading = true;
    },
    stopLoading() {
      this.loading = false;
    },
    signIn(user: User) {
      const {
        displayName,
        email,
        emailVerified,
        isAnonymous,
        uid,
        providerId,
      } = user;
      this.user = {
        displayName,
        emailVerified,
        isAnonymous,
        email,
        uid,
        providerId,
      };
    },
    signOut() {
      this.user = null;
      this.otpAuthParams.length = 0;
    },
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
