import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "~/gen/auth/v1/auth_pb";

interface AuthState {
	user: User | null;
	token: string | null;
	refreshToken: string | null;
	signIn: (token: string, refreshToken: string, user: User) => void;
	updateToken: (token: string, refreshToken: string) => void;
	signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			token: null,
			refreshToken: null,
			signIn: (token: string, refreshToken: string, user: User) => {
				set({ token, refreshToken, user });
			},
			updateToken: (token: string, refreshToken: string) => {
				set({ token, refreshToken });
			},
			signOut: () => {
				set({ token: null, refreshToken: null, user: null });
			},
		}),
		{
			name: "auth-storage",
		},
	),
);
