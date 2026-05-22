import {
    createClient
} from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const initialAuthParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
export const INVITE_LINK_STORAGE_KEY = "medhammer.invite-link";

export const initialAuthLinkType = initialAuthParams.get("type");
export const isInitialInviteLink = initialAuthLinkType === "invite";

if (isInitialInviteLink) {
    window.sessionStorage.setItem(INVITE_LINK_STORAGE_KEY, "true");
}

export const hasStoredInviteLink = () => {
    return window.sessionStorage.getItem(INVITE_LINK_STORAGE_KEY) === "true";
};

export const clearStoredInviteLink = () => {
    window.sessionStorage.removeItem(INVITE_LINK_STORAGE_KEY);
};

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
