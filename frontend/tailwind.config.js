/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import aspectRatio from '@tailwindcss/aspect-ratio';
import lineClamp from '@tailwindcss/line-clamp';
import typographyPlugin from '@tailwindcss/typography';

export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Primary color palette
                primary: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                    950: '#082f49',
                },
                // Secondary color palette
                secondary: {
                    50: '#f5f3ff',
                    100: '#ede9fe',
                    200: '#ddd6fe',
                    300: '#c4b5fd',
                    400: '#a78bfa',
                    500: '#8b5cf6',
                    600: '#7c3aed',
                    700: '#6d28d9',
                    800: '#5b21b6',
                    900: '#4c1d95',
                    950: '#2e1065',
                },
                // Neutral color palette
                neutral: {
                    50: '#f9fafb',
                    100: '#f3f4f6',
                    200: '#e5e7eb',
                    300: '#d1d5db',
                    400: '#9ca3af',
                    500: '#6b7280',
                    600: '#4b5563',
                    700: '#374151',
                    800: '#1f2937',
                    900: '#111827',
                    950: '#030712',
                },
                // Success, error, warning colors
                success: {
                    50: '#f0fdf4',
                    500: '#22c55e',
                    700: '#15803d',
                },
                error: {
                    50: '#fef2f2',
                    500: '#ef4444',
                    700: '#b91c1c',
                },
                warning: {
                    50: '#fffbeb',
                    500: '#f59e0b',
                    700: '#b45309',
                },
                info: {
                    50: '#eff6ff',
                    500: '#3b82f6',
                    700: '#1d4ed8',
                },
            },
            // Font families
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Lexend', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            // Border radius
            borderRadius: {
                '4xl': '2rem',
            },
            // Box shadows
            boxShadow: {
                'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
            // Animation durations
            animation: {
                'spin-slow': 'spin 3s linear infinite',
            }
        },
    },
    plugins: [
        forms,
        typography,
        aspectRatio,
        lineClamp,
        typographyPlugin,
    ],
    darkMode: 'class',
    corePlugins: {
        preflight: false,
    },
    safelist: [
        'bg-primary-50',
        'bg-primary-100',
        'bg-primary-200',
        'bg-primary-300',
        'bg-primary-400',
        'bg-primary-500',
        'bg-primary-600',
        'bg-primary-700',
        'bg-primary-800',
        'bg-primary-900',
        'bg-secondary-50',
        'bg-secondary-100',
        'bg-secondary-200',
        'bg-secondary-300',
        'bg-secondary-400',
        'bg-secondary-500',
        'bg-secondary-600',
        'bg-secondary-700',
        'bg-secondary-800',
        'bg-secondary-900'
    ]
};