import React, { useState } from "react";
import styled from "styled-components";
import '../../App.css';

const Button = styled.button`
    background-color: #645b56;
    color: white;
    border-radius: 5px;
    // font-family: "jua";
    font-size: 1.64rem;

    padding: 1px 6px 1px 6px;
    border-top: 2px solid #767676;
    border-left: 2px solid #767676;
    border-bottom: 2px solid #212121;
    border-right: 2px solid #212121;

    &:hover {
        cursor: pointer;
        background-color: #4a433f;
    }
`;

function SearchMemo(props) {
    const { setParams } = props;

    const [value, setValue] = useState('');

    const handleChange = (event) => {
        setValue(event.target.value);
    }

    const handleSearchClick = (event) => {
        const filter = null;
        const search = (value == "") ? null : value;
        setParams(filter, search);
    }


    return (
        <div>
            <input 
                type="text" value={value} placeholder="검색" onChange={handleChange}
                style={{ border:"solid 2px #645b56", borderRadius:"3px",
                    width: "91px", height: "19px", fontSize: "1.5rem", fontFamily: "jua", color:"#463f3a", paddingTop: "0px", paddingBottom: "0px" }}
            />
            &nbsp;<Button onClick={handleSearchClick}><i className="fa fa-search" aria-hidden="true"></i></Button>
        </div>
    );
}

export default SearchMemo;