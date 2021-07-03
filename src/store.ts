import { User } from "firebase/auth";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { defineStore } from "pinia";
import { decrypt, encrypt } from "./crypt";

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
  otpAuthParams: OtpAuthParam[] | null;
  user: AuthUser | null;
  loading: boolean;
  isInSync: boolean;
  syncedData: {
    user: string;
    exported: string;
    lastSyncedAt: number;
  } | null;
}

export const useStore = defineStore({
  id: "myAuthStore",
  state(): AppState {
    return {
      otpAuthParams: null,
      loading: false,
      user: null,
      isInSync: false,
      syncedData: null,
    };
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
      this.otpAuthParams = null;
    },
    async loadInitialData() {
      const user = this.user;
      if (user) {
        const db = getFirestore();
        const dataDoc = await getDoc(doc(db, "user_exports", user.uid));
        this.$patch((state) => {
          state.syncedData = (dataDoc.data() ?? null) as {
            user: string;
            exported: string;
            lastSyncedAt: number;
          };
        });
      } else {
        this.$patch((state) => {
          state.syncedData = null;
        });
      }
    },
    async decryptAndLoadParams(password: string) {
      if (this.syncedData === null) {
        await this.loadInitialData();
      }
      if (this.syncedData) {
        const decrypted = await decrypt(this.syncedData.exported, password);
        const imported = JSON.parse(decrypted) as {
          params: OtpAuthParam[];
          version: string;
        };
        this.importParams(imported.params, false);
      }
    },
    async syncChanges(password: string) {
      const user = this.user;
      if (user) {
        const message = JSON.stringify({
          version: "1",
          params: this.otpAuthParams,
        });
        const encrypted = await encrypt(message, password);
        const data = {
          user: user.uid,
          exported: encrypted,
          lastSyncedAt: Date.now(),
        };
        const db = getFirestore();
        await setDoc(doc(db, "user_exports", user.uid), data);
        this.isInSync = true;
      }
    },
    addParam(param: OtpAuthParam) {
      if (this.otpAuthParams) {
        this.otpAuthParams.push(param);
        this.isInSync = false;
      }
    },
    importParams(params: OtpAuthParam[], keepExisting: boolean) {
      if (!this.otpAuthParams) this.otpAuthParams = [];
      if (!keepExisting) {
        if (this.otpAuthParams) this.otpAuthParams.length = 0;
      }
      params.forEach((param) => {
        if (
          this.otpAuthParams &&
          this.otpAuthParams.filter(
            (p) =>
              p.secret === param.secret &&
              p.issuer === param.issuer &&
              p.label === param.label
          ).length === 0
        ) {
          this.otpAuthParams.push(param);
        }
      });
      this.isInSync = true;
    },
    deleteParam(index: number) {
      if (this.otpAuthParams) {
        this.otpAuthParams.splice(index, 1);
        this.isInSync = false;
      }
    },
  },
});
