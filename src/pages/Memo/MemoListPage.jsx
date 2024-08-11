import React, { useState, useEffect } from "react";
import styled from "styled-components";
import '../../App.css';
import BasicWrapper from "../../components/Styled/BasicWrapper";
import SortMemo from "../../components/UI/SortMemo";
import SearchMemo from "../../components/UI/SearchMemo";
import MemoList from "../../components/List/MemoList";
import { CheckToken } from "../../utils/CheckToken";
import Apis from "../../apis/Api";

const DivWrapper = styled.div`

    // flex-container 역할
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: baseline;

    margin-bottom: 11px;

    // flex-item 역할
    .flex-item {

    }
`;

function MemoListPage(props) {
    const [filter, setFilter] = useState(null);
    const [search, setSearch] = useState(null);
    const [memos, setMemos] = useState([]);

    const setParams = (filter, search) => {
        setFilter(filter);
        setSearch(search);
    }

    const getMemos = async (queryParams) => {  // 해당 사용자의 모든 메모 리스트 조회 (초기 메인 화면)
        await Apis
            .get(`/memos` + queryParams)
            .then((response) => {
                setMemos(response.data.data);

                var result = document.getElementById("noneResult");
                if (queryParams.startsWith('?search=') && Object.keys(response.data.data).length == 0)  // 검색 결과가 0개일 경우
                    result.style.display = "block";
                else
                    result.style.display = "none";
            })
            .catch((error) => {
                //console.log(error);
            })
    }

    useEffect(() => {
        CheckToken();

        if (filter != null && search == null)
            getMemos(`?filter=${filter}`);
        else if (filter == null && search != null)
            getMemos(`?search=${search}`);
        else
            getMemos('');
    }, [filter, search]);


    return (
        <BasicWrapper>
            <DivWrapper className="flex-container">
                <SortMemo className="flex-item" setParams={setParams} />
                <SearchMemo className="flex-item" setParams={setParams} />
            </DivWrapper>
            <MemoList memos={memos} search={search} />
        </BasicWrapper>
    );
}

export default MemoListPage;