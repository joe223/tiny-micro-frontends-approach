export function log(...msg) {
    console.log('%c[Barfish]', 'background: #222; color: #bada55', ...msg);
}

export function error (err) {
    console.error('%c[Barfish]', 'background: #AA0000; color: #FFFFFF', err);
}