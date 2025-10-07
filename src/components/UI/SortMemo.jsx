import React, { useState, useEffect } from "react";
import styled from "styled-components";
import '../../App.css';

const SortContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;

    #sortBox {
        /* width: 102px;  // 126.5px */
        height: 23px;
        border: solid 2px #645b56;
        border-radius: 3px;

        font-size: 1.5rem;
        font-family: "jua";
        color: #463f3a;

        cursor: pointer;
    }
`;

const Button = styled.button`
    padding: 1.22px 6px 1.23px 6px;  // 1px 6px 1px 6px
    background-color: #645b56;
    border-radius: 5px;
    border-top: 1.9px solid #767676;  // 2px solid #767676;
    border-left: 2px solid #767676;
    border-bottom: 2px solid #212121;
    border-right: 2px solid #212121;

    font-size: 1.7rem;
    font-family: "jua";
    color: white;

    &:hover {
        cursor: pointer;
        background-color: #4a433f;
    }
`;

function SortMemo(props) {
    const { setParam, toggleSearchClick } = props;

    const [value, setValue] = useState('all-memo');  // 시각화 용도의 변수값

    const handleChange = (event) => {
        setValue(event.target.value);
    }

    const handleSortClick = (event) => {
        const nextFilter = (value === 'all-memo') ? null : value;
        setParam(nextFilter, true);
    }

    useEffect(() => {
        setValue('all-memo');
    }, [toggleSearchClick]);


    return (
        <SortContainer>
            <select id="sortBox" value={value} onChange={handleChange}>
                <option value="all-memo">전체 메모</option>
                <option value="private-memo">개인 메모</option>
                <option value="group-memo">공동 메모</option>
                <option value="star-memo">즐겨찾기 개인메모</option>
            </select>
            &nbsp;<Button onClick={handleSortClick}>정렬</Button>
        </SortContainer>
    );
}

export default SortMemo;