import React from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
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

    const progressStartDateTime = "2025-10-15 20:00";
    const middleDateTime = "2025-10-16 06:00";
    const completeEndDateTime = "2025-10-21 00:00";  // or "2025-10-20 23:59"


    return (
        <GlobalWrapper>
            <NoticeModal
                key={`progressModal-${location?.pathname}`}
                isProgressOrComplete={true}
                startDateTime={progressStartDateTime} endDateTime={middleDateTime}
                modalStyle={{ height: "218px", paddingTop: "36px", paddingBottom: "42px" }}
                iconStyle={{ fontSize: "4rem" }} contentStyle={{ lineHeight: "115%" }}
            >
                - 점검 안내 -<br></br>
                <div style={{ lineHeight: "12%" }}><br></br></div>
                10월 16일(수) 00시~06시
                <br></br><br></br>

                * 인프라/서버 이관 및 상향<br></br>
                <div style={{ lineHeight: "5%" }}><br></br></div>
                * 데이터베이스 방화벽 강화<br></br>
                <div style={{ lineHeight: "5%" }}><br></br></div>
                * 기타 버그 및 기능 개선
            </NoticeModal>

            <NoticeModal
                key={`completeModal-${location?.pathname}`}
                isProgressOrComplete={false}
                startDateTime={middleDateTime} endDateTime={completeEndDateTime}
                modalStyle={{ height: "203.5px", paddingTop: "36.5px", paddingBottom: "47px" }}
                iconStyle={{ fontSize: "4rem" }} contentStyle={{ lineHeight: "115%" }}
            >
                [ v 2.2.1 업데이트 완료 ]
                <div style={{ lineHeight: "90%" }}><br></br></div>
                
                * 데이터베이스 방화벽 강화<br></br>
                <div style={{ lineHeight: "5%" }}><br></br></div>
                * 로그인 만료 시 메모 복구<br></br>
                <div style={{ lineHeight: "5%" }}><br></br></div>
                * 검색 결과 및 스크롤 유지
                <div style={{ lineHeight: "5%" }}><br></br></div>
                * 조회 속도 20% 향상
            </NoticeModal>
        </GlobalWrapper>
    );
}

export default GlobalModal;