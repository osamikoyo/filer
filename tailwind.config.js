/** @type {import('tailwindcss').Config} */
module.exports = {
   content: [
       './templates/**/*.{templ,html}', // Указываем, что Tailwind должен сканировать .templ файлы
     ],
  theme: {
    extend: {},
  },
  plugins: [],
}

