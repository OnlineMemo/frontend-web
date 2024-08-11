import axios from 'axios'

function CheckToken() {
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");

    if(!storedAccessToken || !storedRefreshToken) {
        window.location.href = "/login";
    }

    // const storedToken = localStorage.getItem("accessToken");
    // const storedExpirationDate = localStorage.getItem('expirationTime') || '0';

    // if (storedToken) {
    //     axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

    //     const remainingTime = storedExpirationDate - String(new Date().getTime());
    //     if (remainingTime <= '1000') {
    //         localStorage.removeItem('accessToken');
    //         localStorage.removeItem('expirationTime');

    //         window.location.href = '/login';
    //     }
    // }
    // else {
    //     window.location.href = '/login';
    // }
}

export { CheckToken };