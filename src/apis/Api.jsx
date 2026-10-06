import axios from 'axios';
import qs from 'qs';
import { clearToken } from "../utils/TokenUtil"
import { getFullDatetimeStr } from "../utils/TimeUtil"
import { showErrorToast } from "../utils/ToastUtil"
import { throttle } from 'lodash';

// Backend to Frontend 에러 응답 컨벤션
const tokenExpiredCode = "TOKEN_EXPIRED";
const tokenExpiredMessage = "ERROR - JWT 토큰 만료 에러";
const blockedUserCode = "BLOCKED_USER_ERROR";
const blockedUserMessage = "ERROR - Blocked 계정 에러";
const excessRequestUserCode = "EXCESS_REQUEST_USER";
const excessRequestUserMessage = "ERROR - 계정 요청 제한 초과";
const excessRequestOpenAICode = "EXCESS_REQUEST_OPENAI";
const excessRequestOpenAIMessage = "ERROR - AI 요청 제한 초과";

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
        const networkStatus = err.response?.status;  // httpStatus: 백엔드 응답 상태코드, networkStatus: 실제 HTTP 상태코드

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
                } catch (reissueErr) {
                    console.error(reissueErr);

                    const { status: tokenReissueStatus, code: tokenReissueCode, message: tokenReissueMessage } = reissueErr.response?.data || {};
                    const isExcessRequestUser = (tokenReissueStatus === 429 && tokenReissueCode === excessRequestUserCode && tokenReissueMessage === excessRequestUserMessage);
                    if (isExcessRequestUser) {  // 계정 요청제한 시 로그아웃하지 않고 안내만 노출
                        throttleShowErrorToastWithDelay(`요청이 너무 빠릅니다. ${getRetryAfterText(reissueErr)} 후 시도해주세요.`);
                        return Promise.reject({ message: "excessRequest" });
                    }

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

                    const isBlockedUser = (tokenReissueStatus === 403 && tokenReissueCode === blockedUserCode && tokenReissueMessage === blockedUserMessage);
                    redirectToLoginWithAlert(isBlockedUser ? "blockedUser" : "loginExpired");  // 토큰 재발급 실패 시 로그인 화면으로 이동
                    return Promise.reject(err);
                }
                return await Apis.request(originalConfig);  // 토큰 재발급 성공 시 기존 요청 재전송
            }
            // - 기타 401 경우
            else {
                clearToken();
                redirectToLogin(); // 로그인 화면으로 이동
            }
        }
        // [ ERROR 403 ]
        else if (httpStatus === 403) {
            // - 차단 계정인 경우
            if (httpCode === blockedUserCode && httpMessage === blockedUserMessage) {
                redirectToLoginWithAlert("blockedUser");  // 블랙리스트 감지 시 로그인 화면으로 이동
                return Promise.reject({ message: "blockedUser" });
            }
        }
        // [ ERROR 404 ]
        else if (httpStatus === 404) {
            redirectTo404Page(); // 404 Not Found 페이지로 이동
        }
        // [ ERROR 429 ]
        else if (httpStatus === 429 || networkStatus === 429) {
            const isExcessRequestUser = (httpCode === excessRequestUserCode && httpMessage === excessRequestUserMessage);
            const isExcessRequestOpenAI = (httpCode === excessRequestOpenAICode && httpMessage === excessRequestOpenAIMessage);
            // - 계정별 RateLimit 차단대기인 경우 (Backend)
            if (isExcessRequestUser) {
                throttleShowErrorToastWithDelay(`요청이 너무 빠릅니다. ${getRetryAfterText(err)} 후 시도해주세요.`);
                return Promise.reject({ message: "excessRequest" });
            }
            // - IP별 RateLimit 차단대기인 경우 (Cloudflare, WAF)
            // !!! preflight OPTIONS는 브라우저가 직접 요청하므로, 해당 응답은 인터셉터에서 감지 불가능.
            //     따라서 본 429 알림은, 추후 WAF 또는 유료 Cloudflare로 응답 커스텀 시 자동 적용될 예정. !!!
            else if (isExcessRequestOpenAI === false) {
                throttleShowErrorToastWithDelay("요청이 너무 빠릅니다. 잠시 후 시도해주세요.");
                return Promise.reject({ message: "excessRequest" });
            }
        }
        // [ ERROR 500 ]
        else if (httpStatus === 500) {
            const isMemoAITitle = checkURI(originalConfig, '/memos/ai/title', 'post');
            // - 예상치 못한 서버 내부 에러인 경우
            if (isMemoAITitle === false) {
                throttleShowErrorToastWithDelay("서버 오류입니다. 잠시 후 시도해주세요.");
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
            redirectToLoginWithAlert("maintenance");
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

function getRetryAfterText(err) {
    const retryAfter = Number(err.response?.headers?.['retry-after']);
    if (!(retryAfter > 0)) return "잠시";  // 헤더를 못 읽는 경우
    if (retryAfter <= 10) return `${retryAfter}초`;
    if (retryAfter < 3600) return `${Math.ceil(retryAfter / 60)}분`;
    return `${Math.ceil(retryAfter / 3600)}시간`;
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

function redirectToLoginWithAlert(alertValue) {
    sessionStorage.setItem("alert", alertValue);
    clearToken();
    redirectToLogin();
}

const throttleShowErrorToast = throttle((message) => {
    showErrorToast(message);
}, 1500, { leading: true, trailing: false });

function throttleShowErrorToastWithDelay(message) {
    setTimeout(() => {
        throttleShowErrorToast(message);
    }, 600);  // (대기시간: 중첩 방지 600 -> dismiss 보장 150 -> 기본 100)
}

export default Apis;