import axios from 'axios';

const Apis = axios.create({
    baseURL: process.env.REACT_APP_DB_HOST,
});

// API 요청시 헤더에 AccessToken 달아줌.
Apis.interceptors.request.use(function (config) {
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
                    localStorage.clear();
                    redirectToLogin(); // 토큰 재발급 실패 시 로그인 화면으로 이동
                }
            return Promise.reject(err);
        }
        // 기타 401 에러 처리
        else if (err.response?.data?.status === 401) {
            localStorage.clear();  // 이때는 모두 비워주도록함.
            redirectToLogin(); // 로그인 화면으로 이동
        }

        return Promise.reject(err); // 그 외의 에러는 그대로 반환
    }
);

function redirectToLogin() {
    window.location.href = '/login';
}

export default Apis;
