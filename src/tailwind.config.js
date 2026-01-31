/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'sans-serif'],
            },
            colors: {
                dashboard: {
                    dark: '#2B2B2B',
                    light: '#F2F6F9',
                    white: '#FFFFFF',
                    text: {
                        primary: '#333333',
                        secondary: '#888888',
                        light: '#E0E0E0'
                    }
                },
                accent: {
                    pink: '#FFD1D1',
                    green: '#D1FFD1',
                    yellow: '#FFFAD1',
                    blue: '#D1E8FF',
                    purple: '#ECD1FF'
                },

                gray: {
                    50: '#F9FAFB',
                    100: '#F3F4F6',
                    200: '#E5E7EB',
                    300: '#D1D5DB',
                    400: '#9CA3AF',
                    500: '#6B7280',
                    600: '#4B5563',
                    700: '#374151',
                    800: '#2B2B2B',
                    900: '#111827',
                },

                indigo: {
                    50: '#EEF2FF',
                    100: '#E0E7FF',
                    500: '#3B82F6',
                    600: '#2563EB',
                    700: '#1D4ED8',
                }
            },
        },
    },
    plugins: [],
}
