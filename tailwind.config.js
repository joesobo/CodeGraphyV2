/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,vue,ts}'],
  theme: {
    extend: {
      colors: {
        foreground: 'var(--vscode-button-foreground)',
        primary: 'var(--vscode-button-background)',
        'primary-hover':
          'var(--vscode-extensionButton-prominentHoverBackground)',
        dropdown: 'var(--vscode-dropdown-background)',
        border: 'var(--vscode-menu-separatorBackground)',
      },
    },
  },
  plugins: [require('tailwind-scrollbar-hide')],
}
