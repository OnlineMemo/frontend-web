import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import useDetectDropdown from "../../hooks/useDetectDropdown";
import SendFriendshipModal from "../Modal/SendFriendshipModal";
import Apis from "../../apis/Api";

const DropdownContainer = styled.span`
    position: relative;
`;

const DropMenu = styled.div`
    background: #463f3a;
    position: absolute;
    top: 52px;
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
            // left: 22%;
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

    ul li {
        font-size:2rem;
        list-style: none;
        line-height:44px;
        color: #ffffff;
    }

    a {
        text-decoration:none;
        font-size:2rem;
        color: #ffffff;
        border-left: #bcb8b1 solid 2px;
        border-right: #bcb8b1 solid 2px;
        padding: 1px 7px;

        &:hover {
            color: #463f3a;
            background-color: #bcb8b1;
            border-left: #463f3a solid 2px;
            border-right: #463f3a solid 2px;
        }
    }
`;

function FriendOptionDropdownRight(props) {
    const { dropMain, dropItems } = props;

    const [ddIsOpen, ddRef, ddHandler] = useDetectDropdown(false);  // props를 받아오는게 아닌 훅 종류를 사용하였으므로, {}가 아닌, []로 받아야한다.
    // useDetectDropdown(initialValue)의 initialValue를 false로 넣어주었다. 그러므로, IsOpen이 false가 되어 ddIsOpen도 false가 된다.
    // 참고로 dd는 dropdown을 줄여서 적어본것임.

    const [modalOn, setModalOn] = useState(false);
    const [emailValue, setEmailValue] = useState("");

    const [isNone, setIsNone] = useState(false);

    const handleChangeEmail = (event) => {
        setEmailValue(event.target.value);
    }

    const doClickEnter = (event) => {
        if (event.key === 'Enter') {
            handleSendClick();
        }
    };

    const handleSendClick = async (e) => {
        await Apis
            .post(`/friends`, {
                email: emailValue
            })
            .then((response) => {
                setIsNone(false);
                setModalOn(false);
            })
            .catch((error) => {
                setIsNone(true);
            })
    }


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
                                    {index == 1  // 친구요청 부분의 인덱스번호
                                        ? <Link style={{ textDecoration: "none" }} onClick={() => setModalOn(!modalOn)}>{drop.name}</Link>  // 친구요청 클릭하면
                                        : <Link to={drop.link} style={{ textDecoration: "none" }}>{drop.name}</Link>  // 친구목록 또는 수신목록 클릭하면
                                    }
                                </li>
                            );
                        }
                        )}
                    </ul>
                </DropMenu>
            }
            {modalOn && (
                <SendFriendshipModal closeModal={() => { setModalOn(!modalOn); setIsNone(false); }}>
                    <h2>-&nbsp;친구 요청&nbsp;<i className="fa fa-paper-plane-o" aria-hidden="true"></i>&nbsp;-</h2>
                    <div style={{ marginBottom: "4px" }}>
                        초대 id:&nbsp;&nbsp;<input type="text" onChange={handleChangeEmail} onKeyDown={(event) => doClickEnter(event)} placeholder="친구의 id를 입력해주세요." maxLength="16"
                            style={{ width: "138px", textAlign: "center", paddingTop: "4px", paddingBottom: "4px", border: "1px solid #463f3a", borderRadius: "5px", backgroundColor: "#f4f3ee" }} />
                    </div>
                    <span style={isNone ? { display: "", fontSize: "1.26rem", color: "#dd2b2b" } : { display: "none" }}>!!! 이미 초대했거나 없는 사용자입니다 !!!</span>
                    <div style={{ lineHeight: "40%" }}><br></br></div>
                    <button style={{ float: "right", fontSize: "1.5rem" }} onClick={handleSendClick}>요청 완료</button>
                </SendFriendshipModal>
            )}
        </DropdownContainer>
    );
}

export default FriendOptionDropdownRight;