import {
    createClient
} from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const initialAuthHashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
const initialAuthQueryParams = new URLSearchParams(window.location.search);
export const INVITE_LINK_STORAGE_KEY = "medhammer.invite-link";

const initialHashLinkType = initialAuthHashParams.get("type");
const initialQueryLinkType = initialAuthQueryParams.get("type");

export const getPendingInviteToken = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("type") === "invite" ? params.get("token_hash") : null;
};

export const isInitialInviteLink = initialHashLinkType === "invite"
    || (initialQueryLinkType === "invite" && Boolean(initialAuthQueryParams.get("token_hash")));

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
