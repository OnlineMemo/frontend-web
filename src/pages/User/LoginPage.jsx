import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from 'axios'
import '../../App.css';
import HelloWrapper from "../../components/Styled/HelloWrapper";
import ConfirmModal from "../../components/Modal/ConfirmModal";
import { ParseToken } from "../../utils/ParseToken";
import Apis from "../../apis/Api";

const MoreWrapper = styled(HelloWrapper)`
    .loginInput {
        width: 120px;
    }

    .wrongInput {
        border: 3.3px solid #dd2b2b;
        border-radius: 3px;
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
        padding-left: 80px;
        word-break: keep-all;

        @media(max-width: 530.9px) {
            padding-left: 55px;
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

    const [loginFailModalOn, setLoginFailModalOn] = useState(false);
    const [noticeModalOn, setNoticeModalOn] = useState(false);

    const [emailValue, setEmailValue] = useState("");
    const [pwValue, setPwValue] = useState("");
    const [isWrongEmail, setIsWrongEmail] = useState(false);
    const [isWrongPw, setIsWrongPw] = useState(false);

    const handleChangeLoginId = (event) => {
        setEmailValue(event.target.value);
    }

    const handleChangePw = (event) => {
        setPwValue(event.target.value);
    }

    const doClickEnter = (event) => {
        if (event.key === 'Enter' && loginFailModalOn == false) {
            handleLoginClick(emailValue, pwValue);
        }
        else if (event.key === 'Enter' && loginFailModalOn == true) {
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

                    const { isLoggedIn, isAdminUser } = ParseToken(accessToken, refreshToken);
                    if (isLoggedIn) {
                        navigate(isAdminUser ? "/statistics" : "/memos");
                    }
                })
                .catch((error) => {
                    setLoginFailModalOn(true);
                })
        }
    }

    useEffect(() => {
        const storedAccessToken = localStorage.getItem("accessToken");
        const storedRefreshToken = localStorage.getItem("refreshToken");

        if (!storedAccessToken || !storedRefreshToken) {
            const currentDate = new Date();
            const noticeLimitDate = new Date('2025-06-26T00:00:00+09:00');  // 한국 시각 기준으로 2025.06.26 00시
            if (currentDate < noticeLimitDate) {  // 6월26일이 되기전까지는 공지모달 띄움.
                setTimeout(() => {
                    setNoticeModalOn(true);
                }, 300); // 0.3초 딜레이 후에 공지 모달 생성.
            }
        }
        else {
            const { isLoggedIn, isAdminUser } = ParseToken(storedAccessToken, storedRefreshToken);
            if (isLoggedIn) {
                navigate(isAdminUser ? "/statistics" : "/memos");
            }
        }
    }, []);

    useEffect(() => {
        const handleEnterKeyDown = (event) => {  // 엔터키로 공지 모달 닫기.
            if (event.key === "Enter" && noticeModalOn == true) {
                setNoticeModalOn(false);
            }
        };
        if (noticeModalOn) window.addEventListener("keydown", handleEnterKeyDown);

        return () => {
            window.removeEventListener("keydown", handleEnterKeyDown);
        };
    }, [noticeModalOn]);


    return (
        <MoreWrapper>
            <h2>나만의 메모 보관함으로 접속&nbsp;&nbsp;<i className="fa fa-mouse-pointer" aria-hidden="true"></i></h2>
            <h2 style={{ paddingLeft: "18px", paddingRight: "18px" }}>
                <i className="fa fa-user-circle" aria-hidden="true"></i><br></br>
                Login<br></br>
                <hr></hr>
                <div className="flex-container">
                    &nbsp;&nbsp;id:&nbsp;&nbsp;<input type="text" className={`loginInput ${isWrongEmail ? 'wrongInput' : ''}`}  maxLength="16" onChange={handleChangeLoginId} onKeyDown={(event) => doClickEnter(event)} />
                </div>
                <div className="flex-container">
                    pw:&nbsp;&nbsp;<span style={{ width: "0.3px" }}></span><input type="password" className={`loginInput ${isWrongPw ? 'wrongInput' : ''}`}  onChange={handleChangePw} onKeyDown={(event) => doClickEnter(event)} />
                </div>
                <div className="flex-container">
                    <Link to={'/password'}>pw 변경</Link>
                    &nbsp;&nbsp;&nbsp;
                    <Link to={'/signup'}>회원가입</Link>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <button style={{ padding: "1px 6px 1px 6px", borderTop: "2px solid #767676", borderLeft: "2px solid #767676", borderBottom: "2px solid #212121", borderRight: "2px solid #212121" }} onClick={(event) => handleLoginClick(emailValue, pwValue)}>로그인</button>
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
            {noticeModalOn && (
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
            )}
            
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
        </MoreWrapper>
    );
}

export default LoginPage;