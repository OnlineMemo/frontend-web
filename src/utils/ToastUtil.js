import { toast } from 'react-toastify';

let isLoadToastCSS = false;  // 전역 변수

const loadToastCSS = async () => {
    if (!isLoadToastCSS) {  // 필요 시 처음에만 css 동적 임포트. (이후 브라우저 캐싱됨)
        await import('../assets/css/mobileToast.css');  // 커스텀 CSS
        isLoadToastCSS = true;
    }
};

const showToast = async (toastType, text, autoClose = null) => {
    await loadToastCSS();
    toast.dismiss();
    
    setTimeout(() => {
        toast[toastType](text, {  // toast[toastType]() = toast.success(), error(), warn(), info()
            ...(autoClose !== null && { autoClose }),
            // style: { ... },
        });
    }, 100);
};

const showSuccessToast = (toastText, autoClose = null) =>
    setTimeout(() => {
        showToast('success', toastText, autoClose)
    }, 150);  // warn, info 보다 늦게 표시해 dismiss 후 실행을 보장. (대기시간: dismiss 보장 150 -> 기본 100)

const showErrorToast = (toastText, autoClose = null) =>
    setTimeout(() => {
        showToast('error', toastText, autoClose)
    }, 150);  // warn, info 보다 늦게 표시해 dismiss 후 실행을 보장. (대기시간: dismiss 보장 150 -> 기본 100)

const showWarnToast = (toastText, autoClose = null) =>
    showToast('warn', toastText, autoClose);  // (대기시간: 기본 100)

const showInfoToast = (toastText, autoClose = null) =>
    showToast('info', toastText, autoClose);  // (대기시간: 기본 100)

export { showSuccessToast, showErrorToast, showWarnToast, showInfoToast };