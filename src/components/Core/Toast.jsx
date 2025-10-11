import React from "react";
import { ToastContainer, Bounce, Slide } from 'react-toastify';

function Toast(props) {
    return (
        <ToastContainer
            position={'bottom-center'}
            autoClose={1100}  // 1.1초 뒤 자동 닫힘
            hideProgressBar={false}  // 타임 진행바 숨김
            closeOnClick={false}  // 클릭해도 닫히지 않음
            pauseOnHover={false}  // 마우스 올리면 멈춤
            draggable={false}  // 스와이프 제거 가능
            transition={Bounce}
            toastStyle={{
                padding: "5px 25px 5px 18px",
                backgroundColor: "#f4f3ee",  // white
                color: "#463f3a",
                fontFamily: "jua",
                fontSize: "14.5px",
                border: "1.3px solid #bdb8b1",
                borderRadius: "8px",
                whiteSpace: "pre-line"
            }}
        />
    );
}

export default Toast;