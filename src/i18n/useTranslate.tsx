import { createContext, useContext, useMemo, type ReactNode } from "react";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { DEFAULT_LOCALE, translations, type Locale } from "./translations";

export type TranslateParams = Record<string, string | number>;
export type Translate = (key: string, params?: TranslateParams) => string;

dayjs.locale(DEFAULT_LOCALE);

type TranslationContextValue = {
    locale: Locale;
    translate: Translate;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === "object" && value !== null;
};

const interpolate = (template: string, params: TranslateParams = {}) => {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
        const value = params[key];
        return value === undefined ? "" : String(value);
    });
};

const translateFromLocale = (locale: Locale, key: string, params?: TranslateParams) => {
    const segments = key.split(".");
    let current: unknown = translations[locale];

    for (const segment of segments) {
        if (!isRecord(current) || !(segment in current)) {
            return key;
        }

        current = current[segment];
    }

    return typeof current === "string" ? interpolate(current, params) : key;
};

const TranslationContext = createContext<TranslationContextValue>({
    locale: DEFAULT_LOCALE,
    translate: (key, params) => translateFromLocale(DEFAULT_LOCALE, key, params),
});

type TranslationProviderProps = {
    children: ReactNode;
    locale?: Locale;
};

export const TranslationProvider = ({ children, locale = DEFAULT_LOCALE }: TranslationProviderProps) => {
    dayjs.locale(locale);

    const value = useMemo<TranslationContextValue>(() => ({
        locale,
        translate: (key, params) => translateFromLocale(locale, key, params),
    }), [locale]);

    return (
        <TranslationContext.Provider value={value}>
            {children}
        </TranslationContext.Provider>
    );
};

export const useTranslate = () => {
    return useContext(TranslationContext).translate;
};
