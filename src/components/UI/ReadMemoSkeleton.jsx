import React from "react";
import styled, { keyframes } from "styled-components";

const shimmer = keyframes`
    0%   { background-position: -600px 0; }
    100% { background-position: 600px 0; }
`;

const Shimmer = styled.div`
    background: linear-gradient(90deg, #a8a29c 25%, #cac4be 50%, #a8a29c 75%);
    background-size: 600px 100%;
    animation: ${shimmer} 2s infinite linear;
    border-radius: 4px;
`;

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
`;

const TitleBar = styled(Shimmer)`
    width: 42%;
    height: 22px;
    margin: 0 auto;
`;

const ContentLine = styled(Shimmer)`
    height: 21px;
    margin-bottom: 12px;
`;

const contentWidths = ['90%', '75%', '95%', '60%', '80%', '70%', '85%'];

function ReadMemoSkeleton() {
    return (
        <Wrapper>
            <TitleBar />
            <hr />
            {contentWidths.map((w, i) => (
                <ContentLine
                    key={i}
                    style={{ width: w, animationDelay: `${i * 0.07}s` }}
                />
            ))}
        </Wrapper>
    );
}

export default ReadMemoSkeleton;
