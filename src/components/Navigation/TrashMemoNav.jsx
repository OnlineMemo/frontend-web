import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import NavWrapper from "../Styled/NavWrapper";
import ConfirmModal from "../Modal/ConfirmModal";
import usePendingRequest from "../../hooks/usePendingRequest";
import Apis from "../../apis/Api";
import { removePinnedMemoId, removeUnsavedMemo } from "../../utils/MemoUtil";

const Wrapper = styled(NavWrapper)`

    position: sticky;
    top: 0px;
    isolation: isolate;
    z-index: 999;

    ul {
        display: flex;
        flex-direction: row;
        justify-content: space-between;

        align-items: baseline;
    }

    ul li {
        list-style: none;
        line-height: 50px;
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

    .restoreButton {
        background-color: #a1c4df;
        color: #463f3a;

        &:hover {
            background-color: #a1c4dfa4;
        }
    }

    .deleteButton {
        background-color: #dfafa1;
        color: #463f3a;

        &:hover {
            background-color: #dfb1a1a4;
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
`;

function TrashMemoNav(props) {
    const navigate = useNavigate();
    const location = useLocation();

    const [copyClassName, setCopyClassName] = useState('fa fa-clone');
    const [modalOn, setModalOn] = useState(false);
    const [isPending, runPending] = usePendingRequest();

    const handleFirstModalClick = (event) => {
        setModalOn((modalOn) => !modalOn);
    }

    const handleClickCopy = (event) => {
        window.navigator.clipboard.writeText(props.content);
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(props.content);  // 리액트 네이티브에 복사한 텍스트 전송 (모바일 웹뷰앱을 위한 코드)

        setCopyClassName('fa fa-check');
        setTimeout(() => {
            setCopyClassName('fa fa-clone');
        }, 2000); // 2초 딜레이 후에 다시 아이콘 변경.
    }

    const handleRestoreClick = async (event) => {
        await runPending(async () => {
            await Apis
                .put(`/memos/trash/${props.memoId}`)
                .then((response) => {
                    location.key !== "default"
                        ? navigate(-1)
                        : navigate(`/memos/trash`, { replace: true });
                })
                .catch((error) => {
                    //console.log(error);
                })
        });
    }

    const handleDeleteClick = async (event) => {
        await runPending(async () => {
            await Apis
                .delete(`/memos/trash/${props.memoId}`)
                .then((response) => {
                    removePinnedMemoId(Number(props.memoId));
                    removeUnsavedMemo("edit", Number(props.memoId));
                    location.key !== "default"
                        ? navigate(-1)
                        : navigate(`/memos/trash`, { replace: true });
                })
                .catch((error) => {
                    //console.log(error);
                })
        });
    }


    const navItems = [
        <span className="flex-left">
            &nbsp;<i className="fa fa-arrow-left" aria-hidden="true" onClick={() => { navigate(-1) }}></i>
            &nbsp;&nbsp;
            <span className="flex-copy" onClick={handleClickCopy}>
                <i className={copyClassName} aria-hidden="true"></i>
                <span className="copyText">복사</span>
            </span>
        </span>,
        <span><button className="restoreButton" disabled={isPending} onClick={(event) => handleRestoreClick(event)}>복원</button>&nbsp;&nbsp;<button className="deleteButton" disabled={isPending} onClick={(event) => handleFirstModalClick(event)}>삭제</button>&nbsp;</span>
    ];

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
                <ConfirmModal closeModal={() => setModalOn(!modalOn)} customStyle={{ height: "136px" }}>
                    <br></br>
                    <i className="fa fa-exclamation-circle" aria-hidden="true"></i>
                    <h2 className="modalTitle" style={{ fontSize: "1.8rem" }}>
                        정말&nbsp;삭제하시겠습니까?
                        <span className="modalSubTitle">메모가 영구적으로 삭제됩니다.</span>
                    </h2>
                    <br></br>
                    <div style={{ float: "right" }}>
                        <button className="confirmDeleteButton" disabled={isPending} onClick={handleDeleteClick}>확인</button>&nbsp;&nbsp;
                        <button className="cancelButton" onClick={() => setModalOn(!modalOn)}>취소</button>
                    </div>
                </ConfirmModal>
            )}
        </Wrapper>
    );
}

export default TrashMemoNav;
