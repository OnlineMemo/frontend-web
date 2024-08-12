import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from 'axios'
import '../../App.css';
import HelloWrapper from "../../components/Styled/HelloWrapper";
import ConfirmModal from "../../components/Modal/ConfirmModal";
import Apis from "../../apis/Api";

const DivWrapper = styled.div`
    font-size: 1.5rem;
    color: #463f3a;
    line-height: 135%;

    width: 479px;
    margin: 0 auto;

    @media(max-width: 370px) {
        width: 320px;
    }    
    @media(min-width: 371px) and (max-width: 530px) {
        width: 346px;
    }

    ol {
        margin-top: 17px;
        margin-bottom: 16.6px;
        padding-right: 40px;

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
        await Apis
            .post('/login', {
                email: emailValue,
                password: pwValue
            })
            .then((response) => {
                localStorage.setItem('accessToken', response.data.data.accessToken);
                localStorage.setItem('refreshToken', response.data.data.refreshToken);
                // localStorage.setItem('expirationTime', String(response.data.data.accessTokenExpiresIn));
                navigate(`/memos`);
            })
            .catch((error) => {
                setLoginFailModalOn(true);
            })
    }

    useEffect(() => {
        const storedAccessToken = localStorage.getItem("accessToken");
        const storedRefreshToken = localStorage.getItem("accessToken");

        if (!storedAccessToken || !storedRefreshToken) {
            setTimeout(() => {
                setNoticeModalOn(true);
            }, 300); // 0.3초 딜레이 후에 공지 모달 생성.
        }
        else {
            navigate(`/memos`);
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
        <HelloWrapper>
            <h2>나만의 메모 보관함으로 접속&nbsp;&nbsp;<i className="fa fa-mouse-pointer" aria-hidden="true"></i></h2>
            <h2 style={{ paddingLeft: "18px", paddingRight: "18px" }}>
                <i className="fa fa-user-circle" aria-hidden="true"></i><br></br>
                Login<br></br>
                <hr></hr>
                <div className="flex-container">
                    &nbsp;&nbsp;id:&nbsp;&nbsp;<input type="text" style={{ width: "120px" }} maxLength="16" onChange={handleChangeLoginId} onKeyDown={(event) => doClickEnter(event)} />
                </div>
                <div className="flex-container">
                    pw:&nbsp;&nbsp;<input type="password" style={{ width: "122.5px" }} onChange={handleChangePw} onKeyDown={(event) => doClickEnter(event)} />
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
                    <li>간단하고 직관적인 UX/UI 디자인!</li>
                    <li>개인정보 필요없는 10초 회원가입 절차!&nbsp;<br></br>(생성할 id, pw 만 입력하면 끝!)</li>
                    <li>어느 기기에서든지 쉽고 빠르게 로그인 후&nbsp;<br></br>나만의 메모 관리!</li>
                    <li>친구들끼리 그룹을 만들어 공동 메모도 작성 가능!</li>
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
            {noticeModalOn && (
                <ConfirmModal closeModal={() => setNoticeModalOn(!noticeModalOn)}>
                    <i className="fa fa-thumbs-o-up" aria-hidden="true"></i>
                    <h2 className="successSignupModalTitle">
                        서버 대규모 패치 완료.<br></br>
                        빨라진 속도를 체감해보세요!
                    </h2>
                    <button className="cancelButton" onClick={() => setNoticeModalOn(false)}>확인</button>
                </ConfirmModal>
            )}
        </HelloWrapper>
    );
}

export default LoginPage;