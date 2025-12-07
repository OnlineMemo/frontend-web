import axios from 'axios';
import qs from 'qs';
import { clearToken } from "../utils/TokenUtil"
import { getFullDatetimeStr } from "../utils/TimeUtil"
import { showErrorToast } from "../utils/ToastUtil"
import { throttle } from 'lodash';

// Backend to Frontend 만료 응답 컨벤션
const tokenExpiredCode = "TOKEN_EXPIRED";
const tokenExpiredMessage = "ERROR - JWT 토큰 만료 에러";

// Axios 기본 설정
const Apis = axios.create({
    baseURL: process.env.REACT_APP_DB_HOST,
    paramsSerializer: {
        serialize: params => qs.stringify(params, { encode: true })
    },
});

// Axios 인터셉터 설정 (요청)
Apis.interceptors.request.use(function (config) {
    const isBlocked = blockUseService();  // 서비스 이용을 막음. (점검시간에 적용 예정)
    if (isBlocked) {
        return Promise.reject({ message: "maintenance" });
    }

    const storedAccessToken = localStorage.getItem("accessToken");
    if (storedAccessToken) {
        config.headers["Authorization"] = `Bearer ${storedAccessToken}`;  // API 요청 시 헤더에 AccessToken 장착
    }
    return config;  // 항상 config를 반환
});

// Axios 인터셉터 설정 (응답)
let reissueApiPromise = null;
Apis.interceptors.response.use(
    function (response) {
        return response;  // 응답이 성공적일 경우 그대로 반환
    },

    async function (err) {
        const originalConfig = err.config;
        const { status: httpStatus, code: httpCode, message: httpMessage } = err.response?.data || {};  // err.response?.data?.필드명

        // [ ERROR 401 ]
        if (httpStatus === 401) {
            // - 토큰 만료인 경우
            if (httpCode === tokenExpiredCode && httpMessage === tokenExpiredMessage) {
                try {
                    if (reissueApiPromise === null) {
                        const reissueRequestDto = {
                            accessToken: localStorage.getItem("accessToken"),
                            refreshToken: localStorage.getItem("refreshToken"),
                        };
                        reissueApiPromise = axios.post(  // 토큰 재발급 요청 및 Promise 할당
                            `${process.env.REACT_APP_DB_HOST}/reissue`,
                            reissueRequestDto
                        ).then(response => {
                            if (response) {
                                localStorage.setItem("accessToken", response.data.data.accessToken);  // 새 토큰으로 교체
                                localStorage.setItem("refreshToken", response.data.data.refreshToken);
                            }
                            return response;
                        }).finally(() => {
                            reissueApiPromise = null;
                        });
                    }

                    await reissueApiPromise;  // 토큰 재발급 완료까지 대기 (페이지 내 reissue 중복호출 방지)
                    return await Apis.request(originalConfig);  // await 종료 후 기존 요청 재전송
                } catch (err) {
                    console.error(err);

                    const isMemoSave = checkURI(originalConfig, '/memos', 'post');
                    const isMemoUpdate = checkURI(originalConfig, /^\/memos\/\d+$/, 'put');
                    const isMemoAITitle = checkURI(originalConfig, '/memos/ai/title', 'post');
                    if (isMemoSave || isMemoUpdate || isMemoAITitle) {
                        try {
                            const prevRequestDto = originalConfig.data;
                            const parsedDto = prevRequestDto && (typeof prevRequestDto === 'string' ? JSON.parse(prevRequestDto) : prevRequestDto);
                            const memoContent = parsedDto?.content;
                            memoContent && sessionStorage.setItem("memoContent", memoContent);  // 메모 내용 임시저장
                        } catch (parseErr) {
                            // console.error(parseErr);
                        }
                    }
                    
                    sessionStorage.setItem("alert", "loginExpired");
                    clearToken();
                    redirectToLogin(); // 토큰 재발급 실패 시 로그인 화면으로 이동
                }
                return Promise.reject(err);
            }
            // - 기타 401 경우
            else {
                clearToken();
                redirectToLogin(); // 로그인 화면으로 이동
            }
        }
        // [ ERROR 404 ]
        else if (httpStatus === 404) {
            redirectTo404Page(); // 404 Not Found 페이지로 이동
        }
        // [ ERROR 429,500 ]
        else if (httpStatus === 429 || httpStatus === 500) {
            const isMemoAITitle = checkURI(originalConfig, '/memos/ai/title', 'post');
            if (isMemoAITitle === false) {
                const toastMessage = (httpStatus === 429)
                    ? "요청이 너무 빠릅니다. 잠시 후 시도해주세요."  // DDoS 차단대기 알림 (RateLimit)
                    : "서버 오류입니다. 잠시 후 시도해주세요.";  // 단순 500 알림
                setTimeout(() => {
                    throttleShowErrorToast(toastMessage);
                }, 600);  // (대기시간: 중첩 방지 600 -> dismiss 보장 150 -> 기본 100)
            }
        }

        return Promise.reject(err);  // 부모 호출부 catch문으로 전파
    }
);

function blockUseService() {  // 서비스 이용을 막음. (점검시간에 적용 예정)
    const startDateTime = "2025-10-16 00:00";
    const endDateTime = "2025-10-16 06:00";

    const currentDate = new Date();
    const startDate = new Date(getFullDatetimeStr(startDateTime));
    const endDate = new Date(getFullDatetimeStr(endDateTime));
    if (startDate <= currentDate && currentDate <= endDate) {
        const isTest = localStorage.getItem("isTest");
        if (!(isTest && isTest === 'true')) {
            sessionStorage.setItem("alert", "maintenance");
            clearToken();
            redirectToLogin();
            return true;  // axios 요청 막음
        }
    }
    return false;  // axios 요청 허용
}

function checkURI(originalConfig, targetUrl, targetMethod) {
    const { url, method } = originalConfig;
    const isUrlMatched = (targetUrl instanceof RegExp)
        ? targetUrl.test(url)  // regex 자료형인 경우
        : url === targetUrl;  // string 자료형인 경우
    const isMethodMatched = (method?.toLowerCase() === targetMethod);
    return (isUrlMatched) && (isMethodMatched);
}

function redirectToLogin() {
    const pathname = window.location.pathname;
    if (pathname !== '/' && pathname !== '/login') {
        window.location.href = '/login';
    }
}

function redirectTo404Page() {
    const pathname = window.location.pathname;
    if (pathname !== '/friends' && pathname !== '/senders') {  // 친구 미발견 시, 리다이렉트 대신 모달로 알림
        window.location.href = '/404';
    }
}

const throttleShowErrorToast = throttle((message) => {
    showErrorToast(message);
}, 1500, { leading: true, trailing: false });

export default Apis;