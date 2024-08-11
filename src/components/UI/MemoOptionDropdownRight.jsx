import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import '../../App.css';
import useDetectDropdown from "../../hooks/useDetectDropdown";
import axios from 'axios'
import FriendGroupModal from "../Modal/FriendGroupModal";
import InviteFriendList from "../List/InviteFriendList";
import ConfirmModal from "../Modal/ConfirmModal";
import Apis from "../../apis/Api";

const DropdownContainer = styled.div`
    position: relative;

    button {
        background-color: #463f3a;
        color: white;
        border-radius: 5px;
        font-family: "jua";

        &:hover {
            cursor: pointer;
            background-color: #463f3aa4;
        }
    }
`;

const DropMenu = styled.div`
    background: #463f3a;
    position: absolute;
    top: 44.3px;
    left: -17px;
    width: 92px;
    text-align: left;
    border-radius: 7px;
    transform: translate(-50%, -20px);
    z-index: 990;

    @media(max-width: 565px) {
        // left: 145%;
    }

    &:after {  // 세모화살표만들기
        content: "";
        height: 0;
        width: 0;
        position: absolute;
        top: -2px;
        left: 70%;
        transform: translate(-50%, -50%);
        border: 12px solid transparent;
        border-top-width: 0;
        border-bottom-color: #463f3a;
    }

    #dropUl {
        list-style-type: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
    }

    #dropLi {
        border: solid white 2px;
        border-top: #463f3a;
        border-left: #463f3a;
        border-right: #463f3a;

        :last-child {
            border-bottom: #463f3a;
        }

        & > a {
            font-size: 1.5rem;
            border: #463f3a;
        }
    }
`;

const FriendsWrapper = styled.div`
    height: calc(50vh - 105px);
    overflow: auto;

    border: 1.8px solid #463f3a;
    border-radius: 5px;
    padding: 15.5px;

    &::-webkit-scrollbar {
        width: 5px;
        background-color: #bcb8b1;
        border-radius: 4px;
    }
    &::-webkit-scrollbar-thumb {
        background-color: #5e5c58;
        border-radius: 4px;
    }
`;

function MemoOptionDropdownRight(props) {
    const navigate = useNavigate();

    const [ddIsOpen, ddRef, ddHandler] = useDetectDropdown(false);  // props를 받아오는게 아닌 훅 종류를 사용하였으므로, {}가 아닌, []로 받아야한다.
    // useDetectDropdown(initialValue)의 initialValue를 false로 넣어주었다. 그러므로, IsOpen이 false가 되어 ddIsOpen도 false가 된다.
    // 참고로 dd는 dropdown을 줄여서 적은것이다.

    const { dropMain, dropItems, memoId, userResponseDtoList, allFriends, getMemos } = props;

    const [inviteModalOn, setInviteModalOn] = useState(false);
    const [checkedList, setCheckedList] = useState([]);

    const [invitableFriends, setInvitableFriends] = useState([]);

    const [deleteModalOn, setDeleteModalOn] = useState(false);
    const [modalText, setModalText] = useState();

    const handleFirstModalClick = (textValue, event) => {
        setDeleteModalOn((deleteModalOn) => !deleteModalOn);

        if (textValue == "그룹 탈퇴") {
            setModalText("그룹을 탈퇴");
        }
        else {  // textValue == "메모 삭제" 일때
            setModalText("삭제");
        }
    }

    const handleInviteGroupMemo = async (e) => {
        const checkedIdList = checkedList.map((user) => user.userId);  // 친구의 userId만 추출한 리스트 생성.

        await Apis
            .post(`memos/${memoId}`, {
                userIdList: checkedIdList
            })
            .then((response) => {
                navigate(`/memos/${memoId}`);
            })
            .catch((error) => {
                //console.log(error);
            })
    }

    const handleDeleteClick = async (e) => { 
        await Apis
            .delete(`/memos/${memoId}`)
            .then((response) => {
                getMemos();
            })
            .catch((error) => {
                //console.log(error);
            })
    }

    useEffect(() => {
        const users = userResponseDtoList;
        const invitableFriendList = allFriends.filter(obj => !users.map(x => JSON.stringify(x)).includes(JSON.stringify(obj)));
        // 초대할수있는 친구목록 = 친구전체목록 - 원래메모사용자들 차집합
        setInvitableFriends(invitableFriendList);
    }, [getMemos]);


    return (
        <DropdownContainer>
            <span onClick={ddHandler} ref={ddRef}>
                {dropMain}
            </span>
            {ddIsOpen &&
                <DropMenu>
                    <ul id="dropUl">
                        {dropItems.map((drop, index) => {
                            return (
                                <li id="dropLi" key={index}>
                                    {index == 0  // 친구초대 부분의 인덱스번호
                                        ? <Link style={{ textDecoration: "none" }} onClick={() => setInviteModalOn(!inviteModalOn)}>{drop.name}</Link> // 친구초대 클릭하면
                                        : <Link style={{ textDecoration: "none" }} onClick={(event) => handleFirstModalClick(`${drop.name}`, event)}>{drop.name}</Link>  // 메모삭제 클릭하면
                                    }
                                </li>
                            );
                        }
                        )}
                    </ul>
                </DropMenu>
            }
            {inviteModalOn && (
                <FriendGroupModal closeModal={() => setInviteModalOn(!inviteModalOn)}>
                    <h2 style={{ fontSize: "2rem", color: "#463f3a", marginTop: "1.5px", marginBottom: "15px" }}>-&nbsp;초대할 친구들 선택&nbsp;-</h2>
                    <FriendsWrapper>
                        <InviteFriendList checkedList={checkedList} setCheckedList={setCheckedList} friends={invitableFriends} />
                    </FriendsWrapper>
                    <button style={{ float: "right", fontSize: "1.5rem", marginTop: "10px", padding: "1px 6px 1px 6px", borderTop: "2px solid #767676", borderLeft: "2px solid #767676", borderBottom: "2px solid #212121", borderRight: "2px solid #212121" }} onClick={handleInviteGroupMemo}>선택 완료</button>
                </FriendGroupModal>
            )}
            {deleteModalOn && (
                <ConfirmModal closeModal={() => setDeleteModalOn(!deleteModalOn)}>
                    <br></br>
                    <i className="fa fa-exclamation-circle" aria-hidden="true"></i>
                    <h2 className="modalTitle" style={{ fontSize: "1.8rem" }}>정말&nbsp;{modalText}하시겠습니까?</h2>
                    <br></br>
                    <div style={{ float: "right" }}>
                        <button className="confirmDeleteButton" onClick={handleDeleteClick}>확인</button>&nbsp;&nbsp;
                        <button className="cancelButton" onClick={() => setDeleteModalOn(!deleteModalOn)}>취소</button>
                    </div>
                </ConfirmModal>
            )}
        </DropdownContainer>
    );
}

export default MemoOptionDropdownRight;