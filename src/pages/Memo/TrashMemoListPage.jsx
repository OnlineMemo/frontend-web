import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import BasicWrapper from "../../components/Styled/BasicWrapper";
import TrashMemoList from "../../components/List/TrashMemoList";
import MemoListSkeleton from "../../components/UI/MemoListSkeleton";
import ConfirmModal from "../../components/Modal/ConfirmModal";
import { checkToken } from "../../utils/TokenUtil"
import Apis from "../../apis/Api";
import { removePinnedMemoId, removeUnsavedMemo } from "../../utils/MemoUtil";
import usePendingRequest from "../../hooks/usePendingRequest";
import OneMemoFont from '../../assets/fonts/LINESeedKR-Bd.woff2';  // Prefetch Font (!= Preload)

const MoreWrapper = styled(BasicWrapper)`
    .fa-arrow-left {
        border: solid 2.3px;
        border-radius: 6px;
        padding: 1px 6.7px;

        &:hover {
            cursor: pointer;
            background-color: #463f3a;
            color: #bcb8b1;
            border-color: #463f3a;
        }
    }

    h2 {
        text-align: center;
        font-size: 2rem;
        color: #463f3a;

        margin-top: 8px;
        margin-bottom: 16px;
    }

    button {
        background-color: #463f3a;
        color: white;
        border-radius: 5px;
        font-family: "jua";
        font-size: 1.8rem;

        padding: 1px 6px 1px 6px;
        border-top: 2px solid #767676;
        border-left: 2px solid #767676;
        border-bottom: 2px solid #212121;
        border-right: 2px solid #212121;

        &:hover {
            cursor: pointer;
            background-color: #463f3aa4;
        }
    }

    .restoreButton {
        background-color: #a1c4df;
        color: #463f3a;
        font-size: 1.7rem;

        &:hover {
            background-color: #a1c4dfa4;
        }

        @media(max-width: 381px) {
            font-size: 1.35rem;
        }
    }

    .deleteButton {
        background-color: #dfafa1;
        color: #463f3a;
        font-size: 1.7rem;

        &:hover {
            background-color: #dfb1a1a4;
        }

        @media(max-width: 381px) {
            font-size: 1.35rem;
        }
    }
`;

const DivWrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;

    padding-right: 18px;
    margin-bottom: 11px;
`;

function TrashMemoListPage(props) {
    const navigate = useNavigate();

    const [isPending, runPending] = usePendingRequest();
    const [isFirstGetTrashMemos, setIsFirstGetTrashMemos] = useState(false);
    const [trashMemos, setTrashMemos] = useState([]);
    const [modalOn, setModalOn] = useState(false);

    async function getTrashMemos() {  // 해당 사용자의 휴지통 메모 리스트 조회
        await Apis
            .get(`/memos/trash`)
            .then((response) => {
                setTrashMemos(response.data.data);
                setIsFirstGetTrashMemos(true);
            })
            .catch((error) => {
                //console.log(error);
            })
    }

    const handleFirstModalClick = (event) => {
        setModalOn((modalOn) => !modalOn);
    }

    const handleRestoreAllClick = async (event) => {
        await runPending(async () => {
            await Apis
                .put(`/memos/trash`)
                .then(async (response) => {
                    await getTrashMemos();
                })
                .catch((error) => {
                    //console.log(error);
                })
        });
    }

    const handleDeleteAllClick = async (event) => {
        await runPending(async () => {
            await Apis
                .delete(`/memos/trash`)
                .then(async (response) => {
                    trashMemos.forEach((trashMemo) => {
                        removePinnedMemoId(trashMemo.memoId);
                        removeUnsavedMemo("edit", trashMemo.memoId);
                    });
                    setModalOn((modalOn) => !modalOn);
                    await getTrashMemos();
                })
                .catch((error) => {
                    //console.log(error);
                })
        });
    }

    useEffect(() => {
        checkToken();
        getTrashMemos();
    }, []);

    useEffect(() => {
        if (isFirstGetTrashMemos === false) return;

        const storedTrashScroll = sessionStorage.getItem("trashScroll");
        if (storedTrashScroll !== null) {
            const trashMemoListElement = document.getElementById("trashMemoListContainer");
            if (trashMemoListElement) {
                trashMemoListElement.scrollTop = parseInt(storedTrashScroll, 10);  // 스크롤 위치 복원
            }
            sessionStorage.removeItem("trashScroll");
        }
    }, [isFirstGetTrashMemos])


    return (
        <>
            <Helmet>
                <link rel="prefetch" href={OneMemoFont} as="font" type="font/woff2" crossOrigin="anonymous" />
            </Helmet>

            <MoreWrapper id="trashMemoListContainer">
                <h2>
                    <i className="fa fa-arrow-left" aria-hidden="true" onClick={() => { navigate(-1) }}></i>
                    &nbsp;&nbsp;
                    휴지통
                    &nbsp;&nbsp;
                    <i className="fa fa-trash" aria-hidden="true"></i>
                </h2>
                {trashMemos.length > 0 &&
                    <DivWrapper>
                        <button className="restoreButton" disabled={isPending} onClick={(event) => handleRestoreAllClick(event)}>전체 복원</button>&nbsp;&nbsp;
                        <button className="deleteButton" disabled={isPending} onClick={(event) => handleFirstModalClick(event)}>전체 삭제</button>
                    </DivWrapper>
                }
                {isFirstGetTrashMemos === false
                    ? <MemoListSkeleton isTrashMemo={true} />
                    : <TrashMemoList trashMemos={trashMemos} getTrashMemos={getTrashMemos} isFirstGetTrashMemos={isFirstGetTrashMemos} isPending={isPending} runPending={runPending} />
                }

                {modalOn && (
                    <ConfirmModal closeModal={() => setModalOn(!modalOn)} customStyle={{ height: "136px" }}>
                        <br></br>
                        <i className="fa fa-exclamation-circle" aria-hidden="true"></i>
                        <h2 className="modalTitle" style={{ fontSize: "1.8rem" }}>
                            휴지통을&nbsp;비우시겠습니까?
                            <span className="modalSubTitle">모든 메모가 영구적으로 삭제됩니다.</span>
                        </h2>
                        <br></br>
                        <div style={{ float: "right" }}>
                            <button className="confirmDeleteButton" disabled={isPending} onClick={handleDeleteAllClick}>확인</button>&nbsp;&nbsp;
                            <button className="cancelButton" onClick={() => setModalOn(!modalOn)}>취소</button>
                        </div>
                    </ConfirmModal>
                )}
            </MoreWrapper>
        </>
    );
}

export default TrashMemoListPage;
