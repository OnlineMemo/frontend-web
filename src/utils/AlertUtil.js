import { confirmAlert } from 'react-confirm-alert';

let isLoadAlertCSS = false;  // 전역 변수

const showConfirmAlert = async (options) => {
    if (!isLoadAlertCSS) {  // 필요 시 처음에만 css 동적 임포트. (이후 브라우저 캐싱됨)
        await import('react-confirm-alert/src/react-confirm-alert.css');  // 라이브러리 CSS
        await import('../assets/css/confirmAlert.css');  // 커스텀 CSS
        isLoadAlertCSS = true;
    }

    return confirmAlert(options);
};

export { showConfirmAlert };