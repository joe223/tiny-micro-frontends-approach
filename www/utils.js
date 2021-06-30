export function log(...msg) {
    console.log('%c[Barfish]', 'background: #222; color: #bada55', ...msg);
}