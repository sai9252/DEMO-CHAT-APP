import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import io from "socket.io-client"; // Import Socket as SocketIOClient
import { AxiosError } from "axios";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

// Define the type for the auth user
interface AuthUser {
    _id: string;
    // Add other properties of the auth user here
    fullName: string;
    email: string;
}

// Define the type for the store
interface AuthStore {
    authUser: AuthUser | null;
    isSigningUp: boolean;
    isLoggingIn: boolean;
    isUpdatingProfile: boolean;
    isUpdatingProfileName: boolean;
    isCheckingAuth: boolean;
    onlineUsers: string[];
    socket: SocketIOClient.Socket | null;

    checkAuth: () => Promise<void>;
    signup: (data: { fullName: string; email: string; password: string }) => Promise<void>;
    signin: (data: { email: string; password: string }) => Promise<void>;
    signout: () => Promise<void>;
    updateProfile: (data: { fullName: string; email: string }) => Promise<void>;
    updateProfileName: (data: { fullName: string }) => Promise<void>;
    connectSocket: () => void;
    disconnectSocket: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isUpdatingProfileName: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data });
            get().connectSocket();
        } catch (error) {
            console.log("Error in checkAuth:", error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data: { fullName: string; email: string; password: string }) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            set({ authUser: res.data });
            toast.success("Account created successfully");
            get().connectSocket();
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message || "An error occurred. Please check your input.");
            }
        } finally {
            set({ isSigningUp: false });
        }
    },

    signin: async (data: { email: string; password: string }) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/signin", data);
            set({ authUser: res.data });
            toast.success("Logged in successfully");
            get().connectSocket();
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message || "An error occurred. Please check your input.");
            }
        } finally {
            set({ isLoggingIn: false });
        }
    },

    signout: async () => {
        try {
            await axiosInstance.post("/auth/signout");
            set({ authUser: null });
            toast.success("Logged out successfully");
            get().disconnectSocket();
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message || "An error occurred. Please try again.");
            }
        }
    },

    updateProfile: async (data: { fullName: string; email: string }) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({ authUser: res.data });
            toast.success("Profile updated successfully");
        } catch (error) {
            console.log("error in update profile:", error);
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message || "An error occurred. Please try again.");
            }
        } finally {
            set({ isUpdatingProfile: false });
        }
    },
    
    updateProfileName: async (data: { fullName: string }) => {
        set({ isUpdatingProfileName: true });
        try {
            const res = await axiosInstance.put("/auth/update-profile-name", data);
            set({ authUser: res.data });
            toast.success("Profile Name updated successfully");
        } catch (error) {
            console.log("error in update profile:", error);
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message || "An error occurred. Please try again.");
            }
        } finally {
            set({ isUpdatingProfileName: false });
        }
    },
    
    connectSocket: () => {
        const { authUser } = get();
        if (!authUser || get().socket?.connected) return;

        const socket = io(BASE_URL, {
            query: {
                userId: authUser._id,
            },
        });
        socket.connect();

        set({ socket: socket });

        socket.on("getOnlineUsers", (userIds: string[]) => {
            set({ onlineUsers: userIds });
        });
    },
    disconnectSocket: () => {
        const socket = get().socket;
        if (socket && socket.connected) {
            socket.disconnect();
        }
    },
}));