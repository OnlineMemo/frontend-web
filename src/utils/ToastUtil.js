import { toast } from 'react-toastify';

let isLoadToastCSS = false;  // 전역 변수

const loadToastCSS = async () => {
    if (!isLoadToastCSS) {  // 필요 시 처음에만 css 동적 임포트. (이후 브라우저 캐싱됨)
        await import('../assets/css/mobileToast.css');  // 커스텀 CSS
        isLoadToastCSS = true;
    }
};

const showSuccessToast = async (toastText) => {
    await loadToastCSS();
    toast.dismiss();
    setTimeout(() => {
        toast.success(toastText, {
            // style: { ... }
        });
    }, 100);
};

const showErrorToast = async (toastText) => {
    await loadToastCSS();
    toast.dismiss();
    setTimeout(() => {
        toast.error(toastText, {
            // style: { ... }
        });
    }, 100);
};

const showWarnToast = async (toastText) => {
    await loadToastCSS();
    toast.dismiss();
    setTimeout(() => {
        toast.warn(toastText, {
            // style: { ... }
        });
    }, 100);
};

const showInfoToast = async (toastText) => {
    await loadToastCSS();
    toast.dismiss();
    setTimeout(() => {
        toast.info(toastText, {
            autoClose: 10000
        });
    }, 100);
};

export { showSuccessToast, showErrorToast, showWarnToast, showInfoToast };