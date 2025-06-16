import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import '../../App.css';
import NavWrapper from "../Styled/NavWrapper";
import axios from 'axios'
import ConfirmModal from "../Modal/ConfirmModal";
import { CheckToken } from "../../utils/CheckToken";
import Apis from "../../apis/Api";

const Wrapper = styled(NavWrapper)`

    position: sticky;
    top: 0px;

    ul {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        
        align-items: baseline;
    }

    ul li {
        list-style:none;
        line-height:50px;
        padding: 0px 7px;
        font-size: 2rem;
    }  

    .fa-arrow-left {
        font-size: 2.1rem;  
        font-weight: bolder;
        color: #f4f3ee;
        text-shadow: -1.6px 0 #463f3a, 0 1.6px #463f3a, 1.6px 0 #463f3a, 0 -1.6px #463f3a;
        padding: 2.3px 4.8px;

        &:hover {
            cursor: pointer;
            color: #f4f3eea4;
        }
    }

    button {
        border-radius: 6.5px;
        font-family: "jua";
        font-size: 1.75rem;

        width: 51.5px;
        height: 27px;

        padding-bottom: 0px;

        padding: 1px 6px 1px 6px;
        border-top: 2px solid #767676;
        border-left: 2px solid #767676;
        border-bottom: 2px solid #212121;
        border-right: 2px solid #212121;

        &:hover {
            cursor: pointer;
        }
    }

    .editButton {
        background-color: #463f3a;
        color: white;

        &:hover {
            background-color: #463f3aa4;
        }
    }

    .deletePrivateButton {
        background-color: #dfafa1;
        color: #463f3a;

        &:hover {
            background-color: #dfb1a1a4;
        }
    }

    .deleteGroupButton {
        background-color: #dfafa1;
        color: #463f3a;

        width: 80px;

        &:hover {
            background-color: #dfb1a1a4;
        }
    }

    .saveButton {
        background-color: #a1c4df;
        color: #463f3a;

        &:hover {
            background-color: #a1c4dfa4;
        }
    }

    .flex-left {
        display: inline-flex;
        align-items: center;
    }

    .flex-copy {
        display: inline-flex;
        flex-direction: column;
        justify-content: center;
        line-height: 13.7px;
        width: 30px;
        margin-top: 1.5px;

        color: #463f3a;        
        border: solid 1.8px #463f3a;
        border-radius: 6px;
        background-color: #f4f3ee;
        padding: 2.3px 4.8px;

        &:hover {
            cursor: pointer;
            background-color: #f4f3eea4;
        }
    }

    .flex-reload {
        display: inline-flex;
        flex-direction: column;
        justify-content: center;
        line-height: 13.7px;
        width: 30px;
        margin-top: 1.5px;

        color: #463f3a;        
        border: solid 1.8px #463f3a;
        border-radius: 6px;
        background-color: #f4f3ee;
        padding: 2.3px 4.8px;

        font-size: 1.45rem;

        &:hover {
            cursor: pointer;
            background-color: #f4f3eea4;
        }
    }

    .fa-clone {
        font-size: 1.45rem;   
        font-weight: bold;
    }

    .fa-check {
        font-size: 1.45rem;   
        font-weight: bold;
        color: #3fb950;
    }

    .copyText {
        font-size: 1.15rem;
        font-weight: bold; 
        height: 11px;
    }

    .reloadText {
        font-size: 1.15rem;
        font-weight: bold; 
        height: 11px;
    }
`;

function ReadAndEditMemoNav(props) {
    const navigate = useNavigate();

    const [copyClassName, setCopyClassName] = useState('fa fa-clone');

    const [modalOn, setModalOn] = useState(false);
    const [modalText, setModalText] = useState();
    const [lockModalOn, setLockModalOn] = useState(false);
    const [lockUserNickname, setLockUserNickname] = useState();

    const handleFirstModalClick = (textValue, event) => {
        setModalOn((modalOn) => !modalOn);
        setModalText(textValue);
    }

    const handleLockModalOn = (userNickname, event) => {
        setLockUserNickname(userNickname);
        setTimeout(() => {
            setLockModalOn(true);
        }, 10);
    }

    const handleClickCopy = (event) => {   
        window.navigator.clipboard.writeText(props.content);
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(props.content);  // 리액트 네이티브에 복사한 텍스트 전송 (모바일 웹뷰앱을 위한 코드)

        setCopyClassName('fa fa-check');
        setTimeout(() => {
            setCopyClassName('fa fa-clone');
        }, 2000); // 2초 딜레이 후에 다시 아이콘 변경.
    }

    const handleEditClick = async (event) => {
        if (props.purpose == "readGroup") {  // 공동메모일때만 락 제어 API 호출 (불필요한 리소스 낭비 방지.)
            await Apis
                .post(`/memos/${props.memoId}/lock`)
                .then((response) => {
                    props.propPurposeFunction("edit");  // 하위 컴포넌트 함수
                })
                .catch((error) => {
                    const httpStatus = error.response?.status;
                    if (httpStatus == 423) {
                        const lockUserInfo = error.response?.data?.data;
                        handleLockModalOn(lockUserInfo);  // userNickname
                    }
                })
        }
        else {
            props.propPurposeFunction("edit");  // 하위 컴포넌트 함수
        }
    }

    const handleUpdateSaveClick = async (titleValue, contentValue, e) => {
        if (titleValue.length < 1) {
            var element = document.querySelector(".memoTitleInput");
            element.style.border = "3.3px solid #dd2b2b";
            element.style.borderRadius = "5px";
        }
        else {
            await Apis
                .put(`/memos/${props.memoId}`, {
                    title: titleValue,
                    content: contentValue,
                    isStar: null
                })
                .then((response) => {
                    props.propPurposeFunction("read");  // 하위 컴포넌트 함수
                })
                .catch((error) => {
                    //console.log(error);
                })
        }
    }

    const handleDeleteClick = async (event) => {
        await Apis
            .delete(`/memos/${props.memoId}`)
            .then((response) => {
                navigate(`/memos`);
            })
            .catch((error) => {
                //console.log(error);
            })
    }

    useEffect(() => {
        const handleEnterKeyDown = (event) => {  // 엔터키로 편집잠금(Lock) 모달 닫기.
            if (event.key === "Enter" && lockModalOn == true) {
                event.preventDefault();  // '엔터키로 모달이 닫아도 다시 열리는 문제'를 방지 가능.
                setLockModalOn(false);
            }
        };
        if (lockModalOn) window.addEventListener("keydown", handleEnterKeyDown);

        return () => {
            window.removeEventListener("keydown", handleEnterKeyDown);
        };
    }, [lockModalOn]);


    const readPrivateNavItems = [  // 개인메모 보기 용도
        <span className="flex-left">
            &nbsp;<i className="fa fa-arrow-left" aria-hidden="true" onClick={() => { navigate(`/memos`) }}></i>
            &nbsp;&nbsp;
            <span className="flex-copy" onClick={handleClickCopy}>
                <i className={copyClassName} aria-hidden="true"></i>
                <span className="copyText">복사</span>
            </span>
            &nbsp;&nbsp;
            <span className="flex-reload" onClick={() => { window.location.reload() }}>
                <i className="fa fa-refresh" aria-hidden="true"></i>
                <span className="reloadText">로딩</span>
            </span>
        </span>,
        <span><button className="editButton" onClick={handleEditClick}>수정</button>&nbsp;&nbsp;<button className="deletePrivateButton" onClick={(event) => handleFirstModalClick("삭제", event)}>삭제</button>&nbsp;</span>
    ];
    const readGroupNavItems = [  // 공동메모 보기 용도
        <span className="flex-left">
            &nbsp;<i className="fa fa-arrow-left" aria-hidden="true" onClick={() => { navigate(-1) }}></i>
            &nbsp;&nbsp;
            <span className="flex-copy" onClick={handleClickCopy}>
                <i className={copyClassName} aria-hidden="true"></i>
                <span className="copyText">복사</span>
            </span>
            &nbsp;&nbsp;
            <span className="flex-reload" onClick={() => { window.location.reload() }}>
                <i className="fa fa-refresh" aria-hidden="true"></i>
                <span className="reloadText">로딩</span>
            </span>
        </span>,
        <span><button className="editButton" onClick={handleEditClick}>수정</button>&nbsp;&nbsp;<button className="deleteGroupButton" onClick={(event) => handleFirstModalClick("그룹을 탈퇴", event)}>그룹 탈퇴</button>&nbsp;</span>
    ];
    const editNavItems = [  // 메모 수정 용도
        <span className="flex-left">&nbsp;<i className="fa fa-arrow-left" aria-hidden="true" onClick={() => {props.propPurposeFunction("read")}}></i></span>,
        <span><button className="saveButton" onClick={(event) => handleUpdateSaveClick(props.title, props.content, event)}>저장</button>&nbsp;</span>
    ];

    let navItems;
    if (props.purpose == "readPrivate") {
        navItems = readPrivateNavItems;
    }
    else if (props.purpose == "readGroup") {
        navItems = readGroupNavItems;
    }
    else if (props.purpose == "edit") {
        navItems = editNavItems;
    }

    return (
        <Wrapper>
            <ul>
                {navItems.map((navItem, index) => {
                    return (
                        <li key={index}>{navItem}</li>
                    );
                }
                )}
            </ul>
            {modalOn && (
                <ConfirmModal closeModal={() => setModalOn(!modalOn)}>
                    <br></br>
                    <i className="fa fa-exclamation-circle" aria-hidden="true"></i>
                    <h2 className="modalTitle" style={{ fontSize: "1.8rem" }}>정말&nbsp;{modalText}하시겠습니까?</h2>
                    <br></br>
                    <div style={{ float: "right" }}>
                        <button className="confirmDeleteButton" onClick={handleDeleteClick}>확인</button>&nbsp;&nbsp;
                        <button className="cancelButton" onClick={() => setModalOn(!modalOn)}>취소</button>
                    </div>
                </ConfirmModal>
            )}
            {lockModalOn && (
                <ConfirmModal closeModal={() => setLockModalOn(!lockModalOn)} customStyle={{ height: "220px" }}>  {/* height: "208px" */}
                    <i className="fa fa-lock" aria-hidden="true" style={{ fontSize: "4rem", color: "brown" }}></i>
                    <h2 className="successSignupModalTitle">
                        {lockUserNickname}
                    </h2>
                    <button className="cancelButton" onClick={() => setLockModalOn(false)}>확인</button>
                </ConfirmModal>
            )}
        </Wrapper>
    );
}

export default ReadAndEditMemoNav;