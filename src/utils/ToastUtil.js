import { toast } from 'react-toastify';

const showSuccessToast = (toastText) => {
    toast.dismiss();
    setTimeout(() => {
        toast.success(toastText, {
            // style: { ... }
        });
    }, 100);
};

const showErrorToast = (toastText) => {
    toast.dismiss();
    setTimeout(() => {
        toast.error(toastText, {
            // style: { ... }
        });
    }, 100);
};

const showWarnToast = (toastText) => {
    toast.dismiss();
    setTimeout(() => {
        toast.warn(toastText, {
            // style: { ... }
        });
    }, 100);
};

const showInfoToast = (toastText) => {
    toast.dismiss();
    setTimeout(() => {
        toast.info(toastText, {
            autoClose: 5000
        });
    }, 100);
};

export { showSuccessToast, showErrorToast, showWarnToast, showInfoToast };