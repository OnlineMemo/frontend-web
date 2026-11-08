import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import BasicWrapper from "../../components/Styled/BasicWrapper";
import TrashMemoList from "../../components/List/TrashMemoList";
import { checkToken } from "../../utils/TokenUtil"
import Apis from "../../apis/Api";

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
        margin-bottom: 18.5px;
    }
`;

function TrashMemoListPage(props) {
    const navigate = useNavigate();

    const [isFirstGetTrashMemos, setIsFirstGetTrashMemos] = useState(false);
    const [trashMemos, setTrashMemos] = useState([]);

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

    useEffect(() => {
        checkToken();
        getTrashMemos();
    }, []);


    return (
        <MoreWrapper>
            <h2>
                <i className="fa fa-arrow-left" aria-hidden="true" onClick={() => { navigate(-1) }}></i>
                &nbsp;&nbsp;
                휴지통
            </h2>
            <TrashMemoList trashMemos={trashMemos} isFirstGetTrashMemos={isFirstGetTrashMemos} />
        </MoreWrapper>
    );
}

export default TrashMemoListPage;
