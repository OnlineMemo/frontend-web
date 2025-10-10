import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";

const SearchContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;

    #searchBox {
        width: 91px;
        height: 19px;
        padding-top: 0px;
        padding-bottom: 0px;
        border: solid 2px #645b56;
        border-radius: 3px;

        font-size: 1.5rem;
        font-family: "jua";
        color: #463f3a;
    }
`;

const Button = styled.button`
    padding: 0px 6px 1px 6px;  // 1px 6px 1px 6px
    background-color: #645b56;
    border-radius: 5px;
    border-top: 2px solid #767676;
    border-left: 2px solid #767676;
    border-bottom: 2px solid #212121;
    border-right: 2px solid #212121;

    font-size: 1.62rem;  // 1.64rem
    // font-family: "jua";
    color: white;

    &:hover {
        cursor: pointer;
        background-color: #4a433f;
    }
`;

function SearchMemo(props) {
    const { setParam, firstSearchValue, toggleSortClick } = props;

    const isMounted = useRef(false);  // 상태값 즉시반영
    const [value, setValue] = useState(firstSearchValue);  // 시각화 용도의 변수값

    const handleChange = (event) => {
        setValue(event.target.value);
    }

    const handleSearchClick = (event) => {
        const nextSearch = (value === "") ? null : value;
        setParam(nextSearch, false);
    }

    const doClickEnter = (event) => {
        if (event.key === 'Enter') {
            handleSearchClick();
        }
    };

    useEffect(() => {
        if (isMounted.current === true) {
            setValue('');
        }
        else {
            isMounted.current = true;
        }
    }, [toggleSortClick]);


    return (
        <SearchContainer>
            <input type="text" id="searchBox" value={value} placeholder="검색"
                onChange={handleChange} onKeyDown={(event) => doClickEnter(event)}
            />
            &nbsp;<Button onClick={handleSearchClick}><i className="fa fa-search" aria-hidden="true"></i></Button>
        </SearchContainer>
    );
}

export default SearchMemo;