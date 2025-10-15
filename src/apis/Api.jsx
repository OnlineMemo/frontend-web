import axios from 'axios';
import { clearToken } from "../utils/TokenUtil"
import { getFullDatetimeStr } from "../utils/TimeUtil"
import { showErrorToast } from "../utils/ToastUtil"

const Apis = axios.create({
    baseURL: process.env.REACT_APP_DB_HOST,
});

// API 요청시 헤더에 AccessToken 달아줌.
Apis.interceptors.request.use(function (config) {
    const isBlocked = blockUseService();  // 서비스 이용을 막음. (점검시간에 적용 예정.)
    if (isBlocked) {
        return Promise.reject({ message: "maintenance" });
    }

    const storedAccessToken = localStorage.getItem("accessToken");
    if (storedAccessToken) {
        config.headers["Authorization"] = `Bearer ${storedAccessToken}`;
    }
    return config; // 항상 config를 반환
});

// AccessToken 만료됐을때 처리
Apis.interceptors.response.use(
    function (response) {
        return response; // 응답이 성공적일 경우 그대로 반환
    },

    async function (err) {
        const originalConfig = err.config;
        const reissueRequestDto = {
            accessToken: localStorage.getItem("accessToken"),
            refreshToken: localStorage.getItem("refreshToken"),
        };

        // 토큰 만료 에러 처리
        if (err.response?.data?.status === 401 &&
            err.response.data.code === "TOKEN_EXPIRED" &&
            err.response.data.message === "ERROR - JWT 토큰 만료 에러") {
                try {
                    const response = await axios.post(
                        `${process.env.REACT_APP_DB_HOST}/reissue`,
                        reissueRequestDto
                    );

                    if (response) {
                        // 새 토큰을 로컬 스토리지에 저장
                        localStorage.setItem("accessToken", response.data.data.accessToken);
                        localStorage.setItem("refreshToken", response.data.data.refreshToken);

                        // 원래 요청 재전송
                        return await Apis.request(originalConfig);
                    }
                } catch (err) {
                    console.error(err);

                    const { url, method, data } = originalConfig;
                    const isMemoSave = (url === '/memos') && (method?.toLowerCase() === 'post');
                    const isMemoUpdate = /^\/memos\/\d+$/.test(url) && (method?.toLowerCase() === 'put')
                    const isMemoAITitle = (url === '/memos/ai/title') && (method?.toLowerCase() === 'post');
                    if (isMemoSave || isMemoUpdate || isMemoAITitle) {
                        try {
                            const parsedData = data && (typeof data === 'string' ? JSON.parse(data) : data);
                            const memoContent = parsedData?.content;
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
        // 기타 401 에러 처리
        else if (err.response?.data?.status === 401) {
            clearToken();
            redirectToLogin(); // 로그인 화면으로 이동
        }
        else if (err.response?.data?.status === 404) {
            redirectTo404Page(); // 404 Not Found 페이지로 이동
        }
        else if (err.response?.data?.status === 500) {
            const { url, method } = originalConfig;
            const isMemoAITitle = (url === '/memos/ai/title') && (method?.toLowerCase() === 'post');
            if (isMemoAITitle === false) {
                setTimeout(() => {
                    showErrorToast("서버 오류입니다. 잠시 후 시도해주세요.");
                }, 600);  // (대기시간: 중첩 방지 600 -> dismiss 보장 150 -> 기본 100)
            }
        }

        return Promise.reject(err); // 그 외의 에러는 그대로 반환
    }
);

function blockUseService() {  // 서비스 이용을 막음. (점검시간에 적용 예정.)
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

function redirectToLogin() {
    const pathname = window.location.pathname;
    if (pathname !== '/' && pathname !== '/login') {
        window.location.href = '/login';
    }
}

function redirectTo404Page() {
    const pathname = window.location.pathname;
    if (pathname !== '/friends' && pathname !== '/senders') {  // 친구 미발견 시, 리다이렉트 대신 모달로 알림.
        window.location.href = '/404';
    }
}

export default Apis;