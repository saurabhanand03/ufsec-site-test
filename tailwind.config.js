module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            h1: {
              fontSize: '1.75em',
              marginTop: '1.5em',
              marginBottom: '0.5em',
              fontWeight: '700',
            },
            h2: {
              fontSize: '1.5em',
              marginTop: '1.25em',
              marginBottom: '0.5em',
              fontWeight: '600',
            },
            h3: {
              fontSize: '1.25em',
              marginTop: '1em',
              marginBottom: '0.5em',
              fontWeight: '600',
            },
          }
        }
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
