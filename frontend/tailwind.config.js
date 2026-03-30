/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                black: '#2B094E', // Global override: Deep Purple from the logo
                primary: {
                    DEFAULT: '#2B094E',
                    foreground: '#ffffff',
                },
                secondary: {
                    DEFAULT: '#ffffff',
                    foreground: '#2B094E',
                },
                accent: {
                    pink: '#f8f4ff', // Soft purple/pink background tint
                }
            },
            borderRadius: {
                '3xl': '1.5rem',
                '4xl': '2rem',
                '5xl': '2.5rem',
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'sans-serif'],
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
            }
        },
    },
    plugins: [],
}
