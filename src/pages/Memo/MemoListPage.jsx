import React, { useState, useEffect, useRef } from "react";
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

    const isMemosMounted = useRef(false);  // 상태값 즉시반영
    const [isFirstGetMemos, setIsFirstGetMemos] = useState(false);
    const [memos, setMemos] = useState([]);
    const [allFriends, setAllFriends] = useState([]);

    // API 재호출용
    const [filter, setFilter] = useState(null);
    const [search, setSearch] = useState(null);
    // 시각화 변수 첫렌더링용
    const [firstSortValue, setFirstSortValue] = useState(null);
    const [firstSearchValue, setFirstSearchValue] = useState(null);
    // 시각화 변수 초기화용
    const [toggleSortClick, setToggleSortClick] = useState(false);  // 정렬 시, 검색텍스트 초기화를 위함.
    const [toggleSearchClick, setToggleSearchClick] = useState(false);  // 검색 시, 정렬기준 초기화를 위함.

    const setFirstValues = (sortValue, searchValue) => {
        setFirstSortValue(sortValue);
        setFirstSearchValue(searchValue);
    }

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
                setIsFirstGetMemos(true);
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
        // - 동기
        checkToken();

        // - 비동기 (checkToken 검사 후 API 병렬호출)
        // API 1.
        const storedFilter = sessionStorage.getItem("filter");
        const storedSearch = sessionStorage.getItem("search");
        if (['private-memo', 'group-memo', 'star-memo'].includes(storedFilter)) {
            setFirstValues(storedFilter, '');
            setParam(storedFilter, true);  // useEffect[filter, search]에 처리를 위임.
        }
        else if (storedSearch) {
            setFirstValues('all-memo', storedSearch);
            setParam(storedSearch, false);  // useEffect[filter, search]에 처리를 위임.
        }
        else {
            setFirstValues('all-memo', '');
            getMemos();  // API 처리 위임없이 직접 호출.
        }
        ["filter", "search"].forEach(key => sessionStorage.removeItem(key));  // 안전하게 모두 제거.
        // API 2.
        getFriends();
        // API 3.
        const prevEditGroupMemoId = sessionStorage.getItem('editGroupMemoId');
        if(prevEditGroupMemoId) {
            deleteLock(prevEditGroupMemoId);
        }
    }, []);

    useEffect(() => {
        if (!(isMemosMounted.current === true)) {
            isMemosMounted.current = true;  // filter,search 변경 감지 & API 호출 허용
            return;
        }
        getMemos();
    }, [filter, search]);  // 실제 API 호출은 toggleClick 변경에 영향받지 않도록함.

    useEffect(() => {
        const handleBeforeHomeClick = (event) => {
            if (event.target.closest("#mainTitleLink")) {
                const pathName = location.pathname || "/";
                if (pathName === "/memos") {
                    setParam(null, true);
                    setParam(null, false);
                    
                    const memoListElement = document.getElementById("memoListContainer");
                    if (memoListElement) {
                        memoListElement.scrollTo({
                            top: 0,
                            behavior: "smooth" // 여기서 부드러운 스크롤 적용
                        });
                    }
                }
            }
        };
        document.addEventListener("click", handleBeforeHomeClick);
        
        return () => {
            document.removeEventListener("click", handleBeforeHomeClick);
        };
    }, [location]);

    useEffect(() => {
        if (isFirstGetMemos === false) return;

        const storedScroll = sessionStorage.getItem("scroll");
        if (storedScroll !== null) {
            const memoListElement = document.getElementById("memoListContainer");
            if (memoListElement) {
                memoListElement.scrollTop = parseInt(storedScroll, 10);  // 스크롤 위치 복원
            }
            sessionStorage.removeItem("scroll");
        }
    }, [isFirstGetMemos])


    return (
        <>
            <Helmet>
                <link rel="prefetch" href={OneMemoFont} as="font" type="font/woff2" crossOrigin="anonymous" />
            </Helmet>

            <YesLoginNav memoListPageFriends={allFriends} />
            <BasicWrapper id="memoListContainer" style={{ overflowX: "hidden" }}>
                <DivWrapper className="flex-container">
                    {firstSortValue !== null && <SortMemo className="flex-item" setParam={setParam} firstSortValue={firstSortValue} toggleSearchClick={toggleSearchClick} />}
                    {firstSearchValue !== null && <SearchMemo className="flex-item" setParam={setParam} firstSearchValue={firstSearchValue} toggleSortClick={toggleSortClick} />}
                </DivWrapper>
                <MemoList memos={memos} filter={filter} search={search} allFriends={allFriends} getMemos={getMemos} />
            </BasicWrapper>
        </>
    );
}

export default MemoListPage;