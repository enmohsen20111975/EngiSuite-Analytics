/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./frontend/**/*.html",
        "./frontend/**/*.js",
        "./learning/**/*.html"
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                brand: {
                    blue: '#2a5298',
                    dark: '#1e3c72',
                    text: '#2c3e50',
                    light: '#f5f7fa',
                    accent: '#3498db',
                    success: '#2ecc71',
                    warning: '#f39c12',
                    danger: '#e74c3c',
                }
            },
            fontFamily: {
                sans: ['Space Grotesk', 'IBM Plex Mono', 'system-ui', 'sans-serif'],
                mono: ['IBM Plex Mono', 'monospace']
            }
        }
    },
    plugins: []
}
