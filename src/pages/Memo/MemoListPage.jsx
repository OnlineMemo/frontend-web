import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import styled from "styled-components";
import '../../App.css';
import BasicWrapper from "../../components/Styled/BasicWrapper";
import SortMemo from "../../components/UI/SortMemo";
import SearchMemo from "../../components/UI/SearchMemo";
import MemoList from "../../components/List/MemoList";
import { checkToken } from "../../utils/TokenUtil";
import Apis from "../../apis/Api";
import YesLoginNav from "../../components/Navigation/YesLoginNav";
import OneMemoFont from '../../assets/fonts/LINESeedKR-Bd.woff2';  // Prefetch Font (!= Preload)

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

    const [isMounted, setIsMounted] = useState(false);
    const [memos, setMemos] = useState([]);
    const [allFriends, setAllFriends] = useState([]);

    // API 재호출용
    const [filter, setFilter] = useState(null);
    const [search, setSearch] = useState(null);
    // 시각화 변수 초기화용
    const [toggleSortClick, setToggleSortClick] = useState(false);  // 정렬 시, 검색텍스트 초기화를 위함.
    const [toggleSearchClick, setToggleSearchClick] = useState(false);  // 검색 시, 정렬기준 초기화를 위함.

    const setParam = (nextParam, isClickSortOrSearch) => {
        if (isClickSortOrSearch === true) {  // Sort Click
            setToggleSortClick(prev => !prev);
            setFilter(nextParam);
            setSearch(null);
        }
        else {  // Search Click
            setToggleSearchClick(prev => !prev);
            setFilter(null);
            setSearch(nextParam);
        }
    }


    const getMemos = async (e) => {  // 해당 사용자의 모든 메모 리스트 조회 (초기 메인 화면)
        let queryParams = '';
        if (filter !== null && search === null) queryParams = `?filter=${filter}`;
        else if (filter === null && search !== null) queryParams = `?search=${search}`;
        
        await Apis
            .get(`/memos` + queryParams)
            .then((response) => {
                setMemos(response.data.data);
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
        // 동기
        checkToken();

        // 비동기 (checkToken 검사 후 API 병렬호출)
        getMemos();
        getFriends();
        const prevEditGroupMemoId = sessionStorage.getItem('editGroupMemoId');
        if(prevEditGroupMemoId) {
            deleteLock(prevEditGroupMemoId);
        }

        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted === true) {
            getMemos();
        }
    }, [filter, search]);  // 실제 API 호출은 toggleClick 변경에 영향받지 않도록함.

    useEffect(() => {
        const handleBeforeHomeClick = (event) => {
            if (event.target.closest("#mainTitleLink")) {
                const pathName = location.pathname || "/";
                if (pathName === "/memos") {
                    setParam(null, true);
                    setParam(null, false);
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
            <Helmet>
                <link rel="prefetch" href={OneMemoFont} as="font" type="font/woff2" crossOrigin="anonymous" />
            </Helmet>

            <YesLoginNav memoListPageFriends={allFriends} />
            <BasicWrapper style={{ overflowX: "hidden" }}>
                <DivWrapper className="flex-container">
                    <SortMemo className="flex-item" setParam={setParam} toggleSearchClick={toggleSearchClick} />
                    <SearchMemo className="flex-item" setParam={setParam} toggleSortClick={toggleSortClick} />
                </DivWrapper>
                <MemoList memos={memos} filter={filter} search={search} allFriends={allFriends} getMemos={getMemos} />
            </BasicWrapper>
        </>
    );
}

export default MemoListPage;