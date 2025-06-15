/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  // v4에서는 대부분의 설정이 CSS로 이동
  // 커스텀 애니메이션, 키프레임, 브레이크포인트는 app.css의 @theme 블록에서 관리
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
