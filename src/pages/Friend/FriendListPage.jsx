import React, { useState, useEffect } from "react";
import styled from "styled-components";
import '../../App.css';
import { useNavigate } from "react-router-dom";
import BasicWrapper from "../../components/Styled/BasicWrapper";
import FriendList from "../../components/List/FriendList";
import FriendOptionDropdownCenter from "../../components/UI/FriendOptionDropdownCenter";
import { CheckToken } from "../../utils/CheckToken";
import Apis from "../../apis/Api";

const MoreWrapper = styled(BasicWrapper)`
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

    .fa-users {
        font-size: 1.65rem;
    }

    h2 {
        text-align: center;
        font-size: 2rem;
        color: #463f3a;

        margin-top: 8px;
        margin-bottom: 18.5px;
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

    .deleteFriendButton {
        background-color: #dfafa1;
        color: #463f3a;
        font-size: 1.7rem;

        &:hover {
            background-color: #dfb1a1a4;
        }

        @media(max-width: 375px) {
            font-size: 1.4rem;
        }
    }
`;

function FriendListPage(props) {
    const navigate = useNavigate();

    const [friends, setFriends] = useState();

    const dropItemsFriends = [
        {
            name: "> 수신 목록",
            link: `/senders`,
        },
        {
            name: "+ 친구 요청",
        },
    ]

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
        CheckToken();
        getFriends();
    }, []);


    return (
        <MoreWrapper>
            <h2>
                <i className="fa fa-arrow-left" aria-hidden="true" onClick={() => { navigate(-1) }}></i>
                &nbsp;&nbsp;
                친구 목록
                &nbsp;&nbsp;
                <FriendOptionDropdownCenter
                    dropMain={<span><button><i className="fa fa-users" aria-hidden="true"></i>&nbsp;<i className="fa fa-caret-down" aria-hidden="true"></i></button></span>}
                    dropItems={dropItemsFriends}
                />
            </h2>
            <FriendList friends={friends} getFriends={getFriends} />
        </MoreWrapper>
    );
}

export default FriendListPage;