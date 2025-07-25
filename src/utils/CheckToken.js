import axios from 'axios'

function CheckToken() {
    // const isLoggedIn = !!(localStorage.getItem("accessToken") && localStorage.getItem("refreshToken"));
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");

    if (!storedAccessToken || !storedRefreshToken) {
        window.location.href = "/login";
    }
}

export { CheckToken };