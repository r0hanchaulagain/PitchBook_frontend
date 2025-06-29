import { create } from "zustand";

export interface UserProfile {
	_id: string;
	fullName: string;
	email: string;
	phone: string;
	role: "user" | "admin" | "futsalOwner";
	profileImage?: string;
	favoritesFutsal?: string[];
	bookingHistory?: string[];
	isActiveOwner?: boolean;
	createdAt?: string;
	updatedAt?: string;
	isActive?: boolean;
	lastLogin?: string;
}

interface UserState {
	user: UserProfile | null;
	loading: boolean;
	error: string | null;
	setUser: (user: UserProfile | null) => void;
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
	user: null,
	loading: false,
	error: null,
	setUser: (user) => set({ user }),
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),
}));
