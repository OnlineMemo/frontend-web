import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import axios from 'axios'
import MemoListItem from "./MemoListItem";

const MemosWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;

    & > * {  // &는 현재 태그인 Wrapper 태그를 의미하고, *는 전체를 의미하므로, & > * 는 Wrapper 태그에 한단계 밑부분 전체의 자식 선택자 태그들을 범위로 지정한것이다.
        :not(:last-child) {  // Wrapper 태그에 한단계 밑부분 전체의 자식 선택자 태그들중에서 가장 마지막 자식 선택자를 제외한 모든 자식 태그들을 범위로 지정한것이다.
            margin-bottom: 16px;
        }
    }
`;

function MemoList(props) {
    const { userId } = props;

    const baseUrl = "http://localhost:8080";

    const [memos, setMemos] = useState();

    async function getMemos() {  // 해당 사용자의 모든 메모 리스트 조회 (초기 메인 화면)
        await axios
            .get(baseUrl + `/users/${userId}/memos`)
            .then((response) => {
                setMemos(response.data);
                console.log(response);
            })
            .catch((error) => {
                console.log(error);
            })
    }

    useEffect(() => {
        getMemos();  // 출생시점에 getMemos() 한번 실행.
    }, []);

    return (
        <MemosWrapper>
            {memos.map((memo) => {
                return (
                    <Link key={memo.id} style={{ textDecoration: "none" }} to={`/memos/${memo.id}`}>
                        <MemoListItem /> 
                    </Link>
                );
            })}
        </MemosWrapper>
    );
}

export default MemoList;