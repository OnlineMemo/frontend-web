import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import HelloWrapper from "../../components/Styled/HelloWrapper"
import ConfirmModal from "../../components/Modal/ConfirmModal";
import { parseToken } from "../../utils/TokenUtil"
import Apis from "../../apis/Api";

const MoreWrapper = styled(HelloWrapper)`
    .flex-container {
        line-height: 130%;
    }

    .fa-arrow-left {
        border: solid 2.3px;
        border-radius: 6px;
        padding: 1px 6.7px;

        &:hover {
            cursor:pointer;
            background-color: #463f3a;
            color: #bcb8b1;
            border-color: #463f3a;
        }
    }

    .fa-user-plus {
        font-size: 2.1rem;
    }

    .inputInform::placeholder {
        font-size: 7.5px;  // 4.8px
        font-weight: bold;
    }

    .wrongName, .wrongId, .wrongPw, .wrongConfirm {
        border: 3.3px solid #dd2b2b;
        border-radius: 3px;
    }
`;

function SignupPage(props) {
    const navigate = useNavigate();

    const [successModalOn, setSuccessModalOn] = useState(false);
    const [duplicateErrorModalOn, setDuplicateErrorModalOn] = useState(false);
    const [confirmErrorModalOn, setConfirmErrorModalOn] = useState(false);

    const [nameValue, setNameValue] = useState("");
    const [emailValue, setEmailValue] = useState("");
    const [pwValue, setPwValue] = useState("");
    const [confirmValue, setConfirmValue] = useState("");

    const [isWrongName, setIsWrongName] = useState(false);
    const [isWrongId, setIsWrongId] = useState(false);
    const [isWrongPw, setIsWrongPw] = useState(false);
    const [isWrongConfirm, setIsWrongConfirm] = useState(false);

    const [isWrongResult, setIsWrongResult] = useState(false);

    const handleChangeName = (event) => {
        event.target.value = event.target.value.replace(/[^a-z0-9ㄱ-ㅎ가-힣]/gi, '');
        setNameValue(event.target.value);
    }

    const handleChangeEmail = (event) => {
        event.target.value = event.target.value.replace(/[^a-z0-9]/gi, '');
        setEmailValue(event.target.value);
    }

    const handleChangePw = (event) => {
        event.target.value = event.target.value.replace(/[^a-z0-9!@#$%^&*()~]/gi, '');
        setPwValue(event.target.value);
    }

    const handleChangeConfirm = (event) => {
        event.target.value = event.target.value.replace(/[^a-z0-9!@#$%^&*()~]/gi, '');
        setConfirmValue(event.target.value);
    }

    const checkInput = (nameValue, emailValue, pwValue, confirmValue) => {
        if (nameValue.length < 2)
            setIsWrongName(true);
        else
            setIsWrongName(false);

        if (emailValue.length < 4 || 16 < emailValue.length)
            setIsWrongId(true);
        else
            setIsWrongId(false);

        if (pwValue.length < 8)
            setIsWrongPw(true);
        else
            setIsWrongPw(false);

        if (pwValue !== confirmValue)
            setIsWrongConfirm(true)
        else
            setIsWrongConfirm(false);
    }

    const handleSignupClick = async (nameValue, emailValue, pwValue, confirmValue, e) => {
        checkInput(nameValue, emailValue, pwValue, confirmValue);

        if (!(nameValue.length < 2 ||
            (emailValue.length < 4 || 16 < emailValue.length) ||
            pwValue.length < 8 ||
            pwValue !== confirmValue)) {

            await Apis
                .post('/signup', {
                    email: emailValue,
                    password: pwValue,
                    nickname: nameValue
                })
                .then((response) => {
                    setSuccessModalOn(true);
                    setIsWrongResult(false);
                })
                .catch((error) => {
                    setDuplicateErrorModalOn(true);
                })
        }
        else if (pwValue !== confirmValue) {
            setIsWrongResult(true);
            setConfirmErrorModalOn(true);
        }
        else {
            setIsWrongResult(true);
        }
    }

    useEffect(() => {
        const { isLoggedIn, isAdminUser } = parseToken();
        if (isLoggedIn) {
            navigate(isAdminUser ? "/statistics" : "/memos");
        }
    }, []);


    return (
        <MoreWrapper>
            <h2>
                <i className="fa fa-arrow-left" aria-hidden="true" onClick={() => { navigate(-1) }}></i>&nbsp;&nbsp;
                환영합니다!&nbsp;&nbsp;<i className="fa fa-smile-o" aria-hidden="true"></i>
            </h2>
            <h2>
                <i className="fa fa-user-plus" aria-hidden="true"></i><br></br>
                회원가입<br></br>
                <hr></hr>
                <div className="flex-container">
                    &nbsp;&nbsp;이름:&nbsp;&nbsp;<input type="text" className={`inputInform ${isWrongName ? 'wrongName' : ''}`} style={{ width: "114px" }} placeholder=" 한글,영문,숫자 (2자 이상)" size="17" onChange={handleChangeName} aria-label="이름" />
                </div>
                <div className="flex-container">
                    &nbsp;&nbsp;id:&nbsp;&nbsp;<input type="text" className={`inputInform ${isWrongId ? 'wrongId' : ''}`} style={{ width: "132px" }} placeholder=" 영문,숫자 (4~16자)" maxLength="16" onChange={handleChangeEmail} aria-label="아이디" />
                </div>
                <div className="flex-container">
                    pw:&nbsp;&nbsp;<input type="password" className={`inputInform ${isWrongPw ? 'wrongPw' : ''}`} style={{ width: "133px" }} placeholder=" 영문,숫자,특수문자 (8자 이상)" onChange={handleChangePw} aria-label="비밀번호" />
                </div>
                <div className="flex-container">
                    pw 확인:&nbsp;&nbsp;<input type="password" className={`inputInform ${isWrongConfirm ? 'wrongConfirm' : ''}`} style={{ width: "93px" }} placeholder=" pw 재입력" size="14" onChange={handleChangeConfirm} aria-label="비밀번호 확인" />
                </div>
                <div style={{ lineHeight: "40%" }}><br></br></div>
                <div className="flex-container">
                    <button style={{ padding: "1px 6px 1px 6px", borderTop: "2px solid #767676", borderLeft: "2px solid #767676", borderBottom: "2px solid #212121", borderRight: "2px solid #212121" }} onClick={(event) => handleSignupClick(nameValue, emailValue, pwValue, confirmValue)}>가입 완료</button>
                </div>
                {isWrongResult &&
                    <span style={{ fontSize: "1.35rem", color: "#dd2b2b" }}>!!! 입력 양식을 재확인해주세요 !!!</span>
                }
            </h2>
            {successModalOn && (
                <ConfirmModal closeModal={() => setSuccessModalOn(!successModalOn)}>
                    <i className="fa fa-thumbs-o-up" aria-hidden="true"></i>
                    <h2 className="successSignupModalTitle">
                        회원가입 성공.<br></br>
                        로그인 페이지로 이동합니다.
                    </h2>
                    <button className="cancelButton" onClick={() => { setSuccessModalOn(false); navigate('/login'); }}>이동</button>
                </ConfirmModal>
            )}
            {duplicateErrorModalOn && (
                <ConfirmModal closeModal={() => setDuplicateErrorModalOn(!duplicateErrorModalOn)}>
                    <i className="fa fa-exclamation-circle" aria-hidden="true"></i>
                    <h2 className="modalTitle">
                        이미 존재하는 id입니다.<br></br>
                        다시 입력해주세요.
                    </h2>
                    <button className="cancelButton" onClick={() => setDuplicateErrorModalOn(false)}>확인</button>
                </ConfirmModal>
            )}
            {confirmErrorModalOn && (
                <ConfirmModal closeModal={() => setConfirmErrorModalOn(!confirmErrorModalOn)}>
                    <i className="fa fa-exclamation-circle" aria-hidden="true"></i>
                    <h2 className="modalTitle">
                        비밀번호가 일치하지 않습니다.<br></br>
                        다시 입력해주세요.
                    </h2>
                    <button className="cancelButton" onClick={() => setConfirmErrorModalOn(false)}>확인</button>
                </ConfirmModal>
            )}
        </MoreWrapper>
    );
}

export default SignupPage;