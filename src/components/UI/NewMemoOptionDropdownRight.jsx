import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import '../../App.css';
import useDetectDropdown from "../../hooks/useDetectDropdown";
import FriendGroupModal from "../Modal/FriendGroupModal";
import SelectFriendList from "../List/SelectFriendList";
import Apis from "../../apis/Api";

const DropdownContainer = styled.div`
    position: relative;
`;

const DropMenu = styled.div`
    background: #463f3a;
    position: absolute;
    top: 54.7px;
    left: 50%;
    width: 94px;
    text-align: left;
    border-radius: 7px;
    transform: translate(-50%, -20px);
    z-index: 990;  // 페이지위에 겹친 요소들중 가장 위에있는 정도. 숫자가 클수록 위에 있다.

    @media(max-width: 565px) {
        // left: 145%;
    }

    &:after {  // 세모화살표만들기
        content: "";
        height: 0;
        width: 0;
        position: absolute;
        top: -2px;
        left: 50%;
        transform: translate(-50%, -50%);
        border: 12px solid transparent;
        border-top-width: 0;
        border-bottom-color: #463f3a;

        @media(max-width: 565px) {
            left: 70%;
        }
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

function NewMemoOptionDropdownRight(props) {
    const navigate = useNavigate();

    const { dropMain, dropItems } = props;

    const [ddIsOpen, ddRef, ddHandler] = useDetectDropdown(false);  // props를 받아오는게 아닌 훅 종류를 사용하였으므로, {}가 아닌, []로 받아야한다.
    // useDetectDropdown(initialValue)의 initialValue를 false로 넣어주었다. 그러므로, IsOpen이 false가 되어 ddIsOpen도 false가 된다.
    // 참고로 dd는 dropdown을 줄여서 적어본것임.

    const [modalOn, setModalOn] = useState(false);
    const [checkedList, setCheckedList] = useState([]);

    const [friends, setFriends] = useState();

    async function getFriends() {  // 해당 사용자의 모든 친구 리스트 조회
        await Apis
            .get(`/friends?isFriend=1`)
            .then((response) => {
                setFriends(response.data.data);
            })
            .catch((error) => {
                //console.log(error);
            })
    }

    useEffect(() => {
        getFriends();
    }, []);


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
                                    {index == 1  // 새 공동메모 부분의 인덱스번호
                                        ? <Link style={{ textDecoration: "none" }} onClick={() => setModalOn(!modalOn)}>{drop.name}</Link>  // 새 공동메모 클릭하면
                                        : <Link to={drop.link} style={{ textDecoration: "none" }} state={{ isGroup: 0, friendList: [] }}>{drop.name}</Link>  // 새 개인메모 클릭하면
                                    }
                                </li>
                            );
                        }
                        )}
                    </ul>
                </DropMenu>
            }
            {modalOn && (
                <FriendGroupModal closeModal={() => setModalOn(!modalOn)}>
                    <h2 style={{ fontSize: "2rem", color: "#463f3a", marginTop: "1.5px", marginBottom: "15px" }}>-&nbsp;공동 작성할 친구들 선택&nbsp;-</h2>
                    <FriendsWrapper>
                        <SelectFriendList checkedList={checkedList} setCheckedList={setCheckedList} friends={friends} />
                    </FriendsWrapper>
                    <button style={{ float: "right", fontSize: "1.5rem", marginTop: "10px" }} onClick={() => navigate(`/memos/new-memo`, { state: { isGroup: 1, friendList: checkedList }})}>선택 완료</button>
                </FriendGroupModal>
            )}
        </DropdownContainer>
    );
}

export default NewMemoOptionDropdownRight;