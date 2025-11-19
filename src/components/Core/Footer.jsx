import React from "react";
import styled from "styled-components";
import { getKSTDateFromLocal } from "../../utils/TimeUtil"

const FooterContainer = styled.footer`
    color: #463f3a;
    text-align: center;
    
    margin: 9px;
    line-height: 155%;

    @media(min-width: 1365px) {
        margin-top: 18px;
        margin-bottom: 18px;
    }
`;

const FooterText = styled.span`
    font-family: "Kalam-Regular";  // FooterFont
    color: black;
    font-size: 1.2rem;

    @media(min-width: 1365px) {
        font-size: 1.35rem;
    }
`;

function Footer(props) {
    const kstYear = getKSTDateFromLocal(new Date()).getFullYear();

    return (
        <FooterContainer>
            <FooterText>
                <br className="disablePreviewAndDrag" />
                <br className="disablePreviewAndDrag" />
                <strong>
                    {`Copyright 2023-${kstYear}. SAHYUNJIN. all rights reserved.`}
                </strong>
                <br />
            </FooterText>
            {/* <FooterText>content</FooterText> */}
        </FooterContainer>
    );
}

export default Footer;