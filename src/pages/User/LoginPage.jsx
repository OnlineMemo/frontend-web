import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import HelloWrapper from "../../components/Styled/HelloWrapper";
import ConfirmModal from "../../components/Modal/ConfirmModal";
import { parseToken } from "../../utils/TokenUtil"
import { showSuccessToast, showErrorToast } from "../../utils/ToastUtil"
import { showConfirmAlert } from "../../utils/AlertUtil"
import Apis from "../../apis/Api";
import { debounce } from 'lodash';

const MoreWrapper = styled(HelloWrapper)`
    .loginInput {
        width: 120px;
    }

    .wrongInput {
        border: 3.3px solid #dd2b2b;
        border-radius: 3px;
    }

    & > h2 {
        @media(min-height: 648.2px) {
            margin-top: calc(50vh - 277.249px - 30px - 19px);
        }
    }
`;

const SocialProof = styled.div`
    display: flex;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 18px;
    animation: fadeInUp 0.6s ease-out;

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes pulse {
        0%, 100% {
            opacity: 1;
            transform: scale(1);
        }
        50% {
            opacity: 0.6;
            transform: scale(0.85);
        }
    }
`;

const ProofBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px;

    background: rgba(255, 255, 255, 0.85);
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    font-size: 14px;
    color: #333;
    backdrop-filter: blur(4px);

    .dot {
        width: 8px;
        height: 8px;
        background: #4CAF50;
        border-radius: 50%;
        animation: pulse 2s infinite;
    }

    .number {
        font-size: 16px;
        font-weight: 800;
        color: #1a73e8;
    }

    @media(max-width: 530px) {
        padding: 5px 12px;
        font-size: 13px;

        .number {
            font-size: 15px;
        }
    }
`;

const DivWrapper = styled.div`
    width: 479px;
    margin: 0 auto;

    font-size: 1.5rem;
    color: #463f3a;
    line-height: 135%;

    @media(max-width: 370px) {
        width: 320px;
    }
    @media(min-width: 371px) and (max-width: 530px) {
        width: 346px;
    }

    ol {
        margin-top: 17px;
        margin-bottom: 16.6px;
        padding-left: 87px;
        word-break: keep-all;

        @media(max-width: 530.9px) {
            padding-left: 57px;
        }

        @media(min-height: 648.2px) {
            margin-bottom: calc(50vh - 277.249px);
        }
    }

    br {
        @media(min-width: 531px) {
            display: none;
        }
    }
`;

function LoginPage(props) {
    const navigate = useNavigate();

    const [confirmAlertOn, setConfirmAlertOn] = useState(false);
    const [loginFailModalOn, setLoginFailModalOn] = useState(false);
    const [emailValue, setEmailValue] = useState("");
    const [pwValue, setPwValue] = useState("");
    const [isWrongEmail, setIsWrongEmail] = useState(false);
    const [isWrongPw, setIsWrongPw] = useState(false);

    const signupUserCount = 1800;
    const activeUserCount = 530;

    const handleConfirmAlert = (title, message, storedMemoContent = null) => {
        const buttons = [];
        if (storedMemoContent) {
            buttons.push({
                label: '작성 내용 복사',
                onClick: () => {
                    window.navigator.clipboard.writeText(storedMemoContent)
                        .then(() => {
                            showSuccessToast("작성 중이던 내용을 복사했어요!");
                        })
                        .catch(() => {
                            showErrorToast("문제가 발생해, 내용 복사에 실패했습니다.");
                        });
                    window.ReactNativeWebView && window.ReactNativeWebView.postMessage(storedMemoContent)  // 리액트 네이티브에 복사한 텍스트 전송 (모바일 웹뷰앱을 위한 코드)
                    setConfirmAlertOn(false);
                }
            });
        }
        buttons.push({
            label: storedMemoContent ? '닫기' : '확인',
            onClick: () => {
                setConfirmAlertOn(false);
            }
        });

        showConfirmAlert({
            title: title,
            message: message,
            buttons: buttons,
            closeOnEscape: false,  // ESC로 닫기 방지
            closeOnClickOutside: false,  // 모달 외부 클릭 방지
        });
    };

    const handleChangeLoginId = (event) => {
        setEmailValue(event.target.value);
    }

    const handleChangePw = (event) => {
        setPwValue(event.target.value);
    }

    const doClickEnter = (event) => {
        if (event.key !== 'Enter' || confirmAlertOn === true) {
            return;
        }
        if (loginFailModalOn === false) {
            debounceLoginClick(emailValue, pwValue);
        }
        else if (loginFailModalOn === true) {
            setLoginFailModalOn(false);
        }
    };

    const handleLoginClick = async (emailValue, pwValue, e) => {
        const isValidEmail = emailValue.length > 0;
        const isValidPw = pwValue.length > 0;
        setIsWrongEmail(!isValidEmail);
        setIsWrongPw(!isValidPw);

        if (isValidEmail && isValidPw) {
            await Apis
                .post('/login', {
                    email: emailValue,
                    password: pwValue
                })
                .then((response) => {
                    const accessToken = response.data.data.accessToken;
                    const refreshToken = response.data.data.refreshToken;
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', refreshToken);
                    // localStorage.setItem('expirationTime', String(response.data.data.accessTokenExpiresIn));

                    const { isLoggedIn, isAdminUser } = parseToken(accessToken, refreshToken);
                    if (isLoggedIn) {
                        navigate(isAdminUser ? "/statistics" : "/memos");
                    }
                })
                .catch((error) => {
                    if (error.message === "maintenance") {
                        setConfirmAlertOn(true);
                        handleConfirmAlert("점검 안내", "죄송합니다. 서비스 점검 중입니다.");
                        sessionStorage.removeItem("alert");
                    }
                    else {
                        setLoginFailModalOn(true);
                    }
                })
        }
    }
    const debounceLoginClick = useCallback(
        debounce((emailValue, pwValue) => {
            handleLoginClick(emailValue, pwValue);
        }, 200),
        [handleLoginClick]
    );

    useEffect(() => {
        const storedAlertValue = sessionStorage.getItem("alert");
        if (storedAlertValue === "loginExpired") {  // 토큰 만료로 인한 리다이렉트인 경우
            const storedMemoContent = sessionStorage.getItem("memoContent") || null;
            setConfirmAlertOn(true);
            handleConfirmAlert("로그인 만료", "로그인 기간이 만료되었습니다. (2주)", storedMemoContent)  // 또는 "로그인 유지 기간이 만료되었습니다."
            sessionStorage.removeItem("alert");
            storedMemoContent && sessionStorage.removeItem("memoContent");  // 작성중인 메모 내용이 있던 경우
            return;
        }
        else if (storedAlertValue === "maintenance") {  // 점검 시간으로 인한 리다이렉트인 경우
            setConfirmAlertOn(true);
            handleConfirmAlert("점검 안내", "죄송합니다. 서비스 점검 중입니다.");
            sessionStorage.removeItem("alert");
            return;
        }

        const storedAccessToken = localStorage.getItem("accessToken");
        const storedRefreshToken = localStorage.getItem("refreshToken");
        if (storedAccessToken && storedRefreshToken) {
            const { isLoggedIn, isAdminUser } = parseToken(storedAccessToken, storedRefreshToken);
            if (isLoggedIn) {
                navigate(isAdminUser ? "/statistics" : "/memos");
            }
        }
    }, []);


    return (
        <MoreWrapper>
            <h2>나만의 메모 보관함으로 접속&nbsp;&nbsp;<i className="fa fa-mouse-pointer" aria-hidden="true"></i></h2>
            <SocialProof>
                <ProofBadge>
                    {/* 👥 */}
                    <span className="dot" />
                    <span><span className="number">{signupUserCount.toLocaleString()}+</span> 명이 가입</span>
                </ProofBadge>
                <ProofBadge>
                    🔥
                    <span>월 <span className="number">{activeUserCount.toLocaleString()}+</span> 명이 사용</span>
                </ProofBadge>
            </SocialProof>
            <h2 style={{ paddingLeft: "18px", paddingRight: "18px" }}>
                <i className="fa fa-user-circle" aria-hidden="true"></i><br></br>
                Login<br></br>
                <hr></hr>
                <div className="flex-container">
                    &nbsp;&nbsp;id:&nbsp;&nbsp;<input type="text" className={`loginInput ${isWrongEmail ? 'wrongInput' : ''}`} maxLength="16" onChange={handleChangeLoginId} onKeyDown={(event) => doClickEnter(event)} aria-label="아이디" />
                </div>
                <div className="flex-container">
                    pw:&nbsp;&nbsp;<span style={{ width: "0.3px" }}></span><input type="password" className={`loginInput ${isWrongPw ? 'wrongInput' : ''}`} onChange={handleChangePw} onKeyDown={(event) => doClickEnter(event)} aria-label="비밀번호" />
                </div>
                <div className="flex-container">
                    <Link to={'/password'}>pw 변경</Link>
                    &nbsp;&nbsp;&nbsp;
                    <Link to={'/signup'}>회원가입</Link>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <button style={{ padding: "1px 6px 1px 6px", borderTop: "2px solid #767676", borderLeft: "2px solid #767676", borderBottom: "2px solid #212121", borderRight: "2px solid #212121" }} onClick={(event) => debounceLoginClick(emailValue, pwValue)}>로그인</button>
                </div>
            </h2>

            <DivWrapper>
                <ol>
                    <li>간단하고 직관적인 UI/UX 디자인!</li> {/* 간단하고 직관적인 UX/UI 디자인! */}
                    <li>개인정보 필요없는 10초 회원가입 절차!&nbsp;<br></br>(생성할 id, pw 만 입력!)</li>  {/* 개인정보 필요없는 10초 회원가입 절차!&nbsp;<br></br>(생성할 id, pw 만 입력하면 끝!) */}
                    <li>어떤 기기에서든 빠르게 로그인 후 메모 관리!</li>  {/* 어느 기기에서든지 쉽고 빠르게 로그인 후&nbsp;<br></br>나만의 메모 관리! */}
                    <li>친구들끼리 그룹을 만들어 공동 메모도 작성!</li> {/* 친구들끼리 그룹을 만들어 공동 메모도 작성 가능! */}
                    <li>수익창출X 광고없이 무료 이용 가능!</li>
                </ol>
            </DivWrapper>
            {loginFailModalOn && (
                <ConfirmModal closeModal={() => setLoginFailModalOn(!loginFailModalOn)}>
                    <i className="fa fa-exclamation-circle" aria-hidden="true"></i>
                    <h2 className="modalTitle">
                        로그인에 실패하였습니다.<br></br>
                        다시 입력해주세요.
                    </h2>
                    <button className="cancelButton" onClick={() => setLoginFailModalOn(false)}>확인</button>
                </ConfirmModal>
            )}


            {/* ========== < Notice Modals (현재 위치: GlobalModal.jsx 이동) > ========== */}
            
            {/* {noticeModalOn && (
                <ConfirmModal closeModal={() => setNoticeModalOn(!noticeModalOn)} customStyle={{ height: "220px" }}>
                    <i className="fa fa-exclamation-circle" aria-hidden="true" style={{ fontSize: "4rem" }}></i>
                    <h2 className="successSignupModalTitle">
                        - 점검 안내 -<br></br>
                        6월 19일(목) 00시~06시<br></br><br></br>
                        * 메모 동시편집 충돌 해결<br></br>
                        * 현재 수정 중인 사용자 알림<br></br>
                        * 검색 시 대소문자 구분 제거<br></br>
                        * 기타 버그 및 기능 개선
                    </h2>
                    <button className="cancelButton" onClick={() => setNoticeModalOn(false)}>확인</button>
                </ConfirmModal>
            )} */}
            {/* {noticeModalOn && (
                <ConfirmModal closeModal={() => setNoticeModalOn(!noticeModalOn)} customStyle={{ height: "218px", paddingTop: "36px", paddingBottom: "41px" }}>
                    <i className="fa fa-exclamation-circle" aria-hidden="true" style={{ fontSize: "4rem" }}></i>
                    <h2 className="successSignupModalTitle" style={{ lineHeight: "115%" }}>
                        - 업데이트 점검 -<br></br>
                        <div style={{ lineHeight: "12%" }}><br></br></div>
                        9월 30일(화) 00시~06시<br></br><br></br>
                        [ 메모 제목 AI 생성 ]<br></br>
                        <div style={{ lineHeight: "12%" }}><br></br></div>
                        내용만 작성하면, 고민없이<br></br>
                        제목을 대신 지어드려요.
                    </h2>
                    <button className="cancelButton" onClick={() => setNoticeModalOn(false)}>확인</button>
                </ConfirmModal>
            )} */}
            {/* <NoticeModal
                isProgressOrComplete={true}
                startDateTime={"2025-09-27 21:00"} endDateTime={"2025-09-27 21:05"}
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
            </NoticeModal> */}

            {/* {noticeModalOn && (
                <ConfirmModal closeModal={() => setNoticeModalOn(!noticeModalOn)}>
                    <i className="fa fa-thumbs-o-up" aria-hidden="true"></i>
                    <h2 className="successSignupModalTitle">
                        서버 대규모 패치 완료.<br></br>
                        속도 60배, 직접 실감하세요!
                    </h2>
                    <button className="cancelButton" onClick={() => setNoticeModalOn(false)}>확인</button>
                </ConfirmModal>
            )} */}
            {/* {noticeModalOn && (
                <ConfirmModal closeModal={() => setNoticeModalOn(!noticeModalOn)} customStyle={{ height: "204px" }}>
                    <i className="fa fa-thumbs-o-up" aria-hidden="true" style={{ fontSize: "4rem" }}></i>
                    <h2 className="successSignupModalTitle">
                        [ v 2.1.0 업데이트 완료 ]<br></br><br></br>
                        * 공동메모 읽기/편집 모드<br></br>
                        * 메모 동시편집 충돌 해결<br></br>
                        * 현재 수정 중인 사용자 알림<br></br>
                        * 검색 시 대소문자 구분 제거
                    </h2>
                    <button className="cancelButton" onClick={() => setNoticeModalOn(false)}>확인</button>
                </ConfirmModal>
            )} */}
            {/* {noticeModalOn && (
                <ConfirmModal closeModal={() => setNoticeModalOn(!noticeModalOn)} customStyle={{ height: "220px", paddingTop: "36.5px", paddingBottom: "50px" }}>
                    <i className="fa fa-thumbs-o-up" aria-hidden="true" style={{ fontSize: "4rem" }}></i>
                    <h2 className="successSignupModalTitle" style={{ lineHeight: "115%" }}>
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
                    </h2>
                    <button className="cancelButton" onClick={() => setNoticeModalOn(false)}>확인</button>
                </ConfirmModal>
            )} */}
            {/* <NoticeModal
                isProgressOrComplete={false}
                startDateTime={"2025-09-27 21:10"} endDateTime={"2025-09-27 21:15"}
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
            </NoticeModal> */}
        </MoreWrapper>
    );
}

export default LoginPage;