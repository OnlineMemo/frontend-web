import React from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import '../../App.css';
import NoticeModal from "./NoticeModal";

const GlobalWrapper = styled.div`
    font-family: "jua";

    button {
        background-color: #463f3a;
        color: white;
        border-radius: 5px;
        font-family: "jua";

        &:hover {
            cursor:pointer;
            background-color: #2c2927;
        }
    }
`;

function GlobalModal(props) {  // Global Modals Component (with Route)
    const location = useLocation();

    const progressStartDateTime = "2025-09-28 00:00";
    const middleDateTime = "2025-09-30 00:00";
    const completeEndDateTime = "2025-09-30 06:00";


    return (
        <GlobalWrapper>
            <NoticeModal
                key={`progressModal-${location?.pathname}`}
                isProgressOrComplete={true}
                startDateTime={progressStartDateTime} endDateTime={middleDateTime}
                modalStyle={{ height: "218px", paddingTop: "36px", paddingBottom: "41px" }}
                iconStyle={{ fontSize: "4rem" }} contentStyle={{ lineHeight: "115%" }}
            >
                - 업데이트 점검 -<br></br>
                <div style={{ lineHeight: "12%" }}><br></br></div>
                9월 30일(화) 00시~06시
                <br></br><br></br>

                [ 메모 제목 AI 생성 ]<br></br>
                <div style={{ lineHeight: "12%" }}><br></br></div>
                내용만 작성하면, 고민없이<br></br>
                제목을 대신 지어드려요.
            </NoticeModal>

            <NoticeModal
                key={`completeModal-${location?.pathname}`}
                isProgressOrComplete={false}
                startDateTime={middleDateTime} endDateTime={completeEndDateTime}
                modalStyle={{ height: "220px", paddingTop: "36.5px", paddingBottom: "50px" }}
                iconStyle={{ fontSize: "4rem" }} contentStyle={{ lineHeight: "115%" }}
            >
                [ v 2.2.0 신규 기능 ]
                <div style={{ lineHeight: "90%" }}><br></br></div>
                
                - 메모 제목 AI 생성 -<br></br>
                <div style={{ lineHeight: "12%" }}><br></br></div>
                내용만 작성하면, 고민없이<br></br>
                제목을 대신 지어드려요.
                <div style={{ lineHeight: "50%" }}><br></br></div>
                <div style={{ fontSize: "15px", lineHeight: "118%" }}>
                    * 메모 생성/편집 시 AI 버튼 활성화<br></br>
                    * 작성 중인 내용을 토대로 제목 생성
                </div>
            </NoticeModal>
        </GlobalWrapper>
    );
}

export default GlobalModal;