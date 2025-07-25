import { jwtDecode } from "jwt-decode";

function ParseToken() {
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");
    if (!storedAccessToken || !storedRefreshToken) {
        return null;
    }

    try {
        const decoded = jwtDecode(storedAccessToken);
        return decoded.sub;  // 로그인 사용자의 id
    } catch (error) {
        return null;
    }
}

export { ParseToken };