import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import '../../App.css';
import BasicWrapper from "../../components/Styled/BasicWrapper";
import SortMemo from "../../components/UI/SortMemo";
import SearchMemo from "../../components/UI/SearchMemo";
import MemoList from "../../components/List/MemoList";
import { CheckToken } from "../../utils/CheckToken";
import Apis from "../../apis/Api";
import YesLoginNav from "../../components/Navigation/YesLoginNav";

const DivWrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: center;  // baseline

    margin-top: 1.3px;
    margin-bottom: 11px;

    /* .flex-item { } */
`;

function MemoListPage(props) {
    const location = useLocation();

    const [filter, setFilter] = useState(null);
    const [search, setSearch] = useState(null);
    const [memos, setMemos] = useState([]);
    const [allFriends, setAllFriends] = useState([]);

    const [isSortClick, setIsSortClick] = useState(false);  // 정렬 시, 검색텍스트 초기화를 위함.
    const [isSearchClick, setIsSearchClick] = useState(false);  // 검색 시, 정렬기준 초기화를 위함.

    const setParams = (filter, search) => {
        setFilter(filter);
        setSearch(search);
    }

    const getMemos = async (e) => {  // 해당 사용자의 모든 메모 리스트 조회 (초기 메인 화면)
        let queryParams = '';
        if (filter !== null && search === null) queryParams = `?filter=${filter}`;
        else if (filter === null && search !== null) queryParams = `?search=${search}`;
        
        await Apis
            .get(`/memos` + queryParams)
            .then((response) => {
                setMemos(response.data.data);
                setIsSortClick(search === null);
                setIsSearchClick(filter === null);
            })
            .catch((error) => {
                //console.log(error);
            })
    }

    async function getFriends() {  // 해당 사용자의 모든 친구 리스트 조회
        await Apis
            .get(`/friends?isFriend=1`)
            .then((response) => {
                setAllFriends(response.data.data);
            })
            .catch((error) => {
                //console.log(error);
            })
    }

    async function deleteLock(memoId) {
        await Apis
            .delete(`/memos/${memoId}/lock`)
            .then((response) => {
                sessionStorage.removeItem('editGroupMemoId');
            })
            .catch((error) => {
                //console.log(error);
            })
    }

    useEffect(() => {
        CheckToken();
        getMemos();
        getFriends();
    }, [filter, search]);

    useEffect(() => {
        const prevEditGroupMemoId = sessionStorage.getItem('editGroupMemoId');
        if(prevEditGroupMemoId) {
            deleteLock(prevEditGroupMemoId);
        }
    }, []);

    useEffect(() => {
        const handleBeforeHomeClick = (event) => {
            if (event.target.closest("#mainTitleLink")) {
                const pathName = location.pathname || "/";
                if (pathName === "/memos" && !(filter === null && search === null)) {
                    setIsSortClick(true);
                    setIsSearchClick(true);
                    setParams(null, null);
                }
            }
        };
        document.addEventListener("click", handleBeforeHomeClick);
        
        return () => {
            document.removeEventListener("click", handleBeforeHomeClick);
        };
    }, [location]);


    return (
        <>
            <YesLoginNav memoListPageFriends={allFriends} />
            <BasicWrapper style={{ overflowX: "hidden" }}>
                <DivWrapper className="flex-container">
                    <SortMemo className="flex-item" setParams={setParams} isSearchClick={isSearchClick} />
                    <SearchMemo className="flex-item" setParams={setParams} isSortClick={isSortClick} />
                </DivWrapper>
                <MemoList memos={memos} filter={filter} search={search} allFriends={allFriends} getMemos={getMemos} />
            </BasicWrapper>
        </>
    );
}

export default MemoListPage;