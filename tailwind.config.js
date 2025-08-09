/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/app/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/hooks/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/utils/**/*.{js,ts,jsx,tsx}',
    './src/app/globals.css',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          indigo: '#4338CA',
          white: '#FFFFFF',
          black: '#000000',
        },
      },
      fontSize: {
        'text-s': [
          '12px',
          {
            lineHeight: '16px',
          },
        ],
        'text-m': [
          '14px',
          {
            lineHeight: '20px',
          },
        ],
        'text-l': [
          '16px',
          {
            lineHeight: '24px',
          },
        ],
        'heading-s': [
          '20px',
          {
            lineHeight: '28px',
          },
        ],
        'heading-m': [
          '26px',
          {
            lineHeight: '36px',
          },
        ],
        'heading-l': [
          '36px',
          {
            lineHeight: '44px',
          },
        ],

        'heading-xl': [
          '44px',
          {
            lineHeight: '60px',
          },
        ],
        'heading-2xl': [
          '60px',
          {
            lineHeight: '72px',
          },
        ],
      },
    },
  },
  plugins: [],
};
