import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import styled from "styled-components";
import './App.css';
import LoadingNav from "./components/Navigation/LoadingNav";
import BasicWrapper from "./components/Styled/BasicWrapper";
import { retryLazy } from "./utils/lazyUtil.js"
const LazyLoad = (path) => retryLazy(() => import(`${path}`));
const NoLoginNav = LazyLoad("./components/Navigation/NoLoginNav");
const LoginPage = LazyLoad("./pages/User/LoginPage");
const SignupPage = LazyLoad("./pages/User/SignupPage");
const ChangePwPage = LazyLoad("./pages/User/ChangePwPage");
const YesLoginNav = LazyLoad("./components/Navigation/YesLoginNav");
const MemoListPage = LazyLoad("./pages/Memo/MemoListPage");
const InformationPage = LazyLoad("./pages/Etc/InformationPage");
const ReadAndEditMemoPage = LazyLoad("./pages/Memo/ReadAndEditMemoPage");
const NewMemoPage = LazyLoad("./pages/Memo/NewMemoPage");
const UserProfilePage = LazyLoad("./pages/User/UserProfilePage");
const FriendListPage = LazyLoad("./pages/Friend/FriendListPage");
const SenderListPage = LazyLoad("./pages/Friend/SenderListPage");
const NoticePage = LazyLoad("./pages/Etc/NoticePage");
const DownloadPage = LazyLoad("./pages/Etc/DownloadPage");
const NotFoundPage = LazyLoad("./pages/Etc/NotFoundPage");

const MainTitleText = styled.header`
    font-size: 3rem;
    text-align: center;
    font-family: "KOTRAHOPE";
    margin: 9px 0px;
    color: #463f3a;

    @media(min-width: 1365px) {
        font-size: 3.3rem;
        margin: 18px 0px;
    }
`;

const LittleTitle = styled.div`
    font-size: 1.25rem;
    text-align: center;
    font-family: "KOTRAHOPE";
    color: #463f3a;

    @media(min-width: 1365px) {
        font-size: 1.7rem;
    }
`;

function HelmetComponent() {
  const location = useLocation();
  const pathName = location.pathname || "/";

  const getHelmetTitle = () => {
    let helmetTitle = "온라인 메모장";
    if (pathName === "/signup") helmetTitle += " - 회원가입";
    else if (pathName === "/password") helmetTitle += " - 비밀번호 변경";
    else if (pathName === "/information") helmetTitle += " - 개발 정보";
    else if (pathName === "/notice") helmetTitle += " - 공지사항";
    else if (pathName === "/download") helmetTitle += " - 다운로드 안내";
    return helmetTitle;
  }

  const getHelmetCanonical = () => {
    let helmetCanonical = "https://www.onlinememo.kr";
    if (pathName === "/login") helmetCanonical += "/";
    else helmetCanonical += pathName;
    return helmetCanonical;
  }

  // <!-- Google tag (gtag.js) - GA4 -->
  useEffect(() => {
    const isLocalhost = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    if (!isLocalhost && typeof window.gtag === 'function') {
      // '/memos/${memoId}' 패턴이면 '/memos/:memoId'로 통합 집계 (event)
      const normalizedPathName = pathName.replace(/^\/memos\/\d+$/, '/memos/:memoId');
      window.gtag('event', 'page_view', {
        page_path: normalizedPathName,
        page_location: window.location.href
      });

      // 로그인 필수 페이지의 통합 집계 (event)
      const authRequiredPages = ['/users', '/friends', '/senders', '/memos', '/memos/:memoId', '/memos/new-memo'];
      if (authRequiredPages.includes(normalizedPathName)) {
        window.gtag('event', 'page_view', {
          page_path: '/auth-pages',
          page_location: window.location.href
        });
      }
    }
  }, [pathName]);

  return (
      <Helmet>
        <title>{getHelmetTitle()}</title>
        {/* <meta name="description" content="📝 모든 기기에서 간편하게 메모를 작성하고, 친구와 공동 편집도 가능한 온라인 메모장입니다. 📝" data-react-helmet="true"/> */}
        <link rel="canonical" href={getHelmetCanonical()} />
      </Helmet>
  );
}

function TitleComponent() {  // 홈키
  const location = useLocation();
  const pathName = location.pathname || "/";
  const isLoggedIn = !!(localStorage.getItem("accessToken") && localStorage.getItem("refreshToken"));

  return (
      <MainTitleText>
        <Link
          id="mainTitleLink"
          to={
            isLoggedIn === true
              ? "/memos"
              : (pathName === "/" || pathName === "/login" ? pathName : "/")
          }
          style={{ textDecoration: "none", color: "#463f3a" }}
        >
          온라인 메모장 <i className="fa fa-pencil-square-o" aria-hidden="true"></i>
          <LittleTitle>OnlineMemo.kr</LittleTitle>
        </Link>
      </MainTitleText>
  );
}

function LoadingComponent() {
  return (
    <div>
      <LoadingNav />
      <BasicWrapper>
        <div style={{textAlign: "center", fontSize: "16px"}}>
          loading...
        </div>
      </BasicWrapper>
    </div>
  );
}

function App(props) {
  useEffect(() => {
    const applyStyle = (element) => {
      // 길게 터치해 이동 시, 나타나는 링크 미리보기 창 방지
      if (!element.hasAttribute('draggable')) {
        element.setAttribute('draggable', 'false');
      }
      // 길게 터치 시, 나타나는 페이지 미리보기 창 방지
      element.style.webkitTouchCallout = 'none';  // -webkit-touch-callout: none;
      // 텍스트 드래그 선택 방지
      element.style.webkitUserSelect = 'none';  // -webkit-user-select: none;
      element.style.userSelect = 'none';  // user-select: none;
    };

    const observer = new MutationObserver(() => {
      const dragElements = document.querySelectorAll('a, img');
      dragElements.forEach(dragElement => applyStyle(dragElement));
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // 초기에도 한 번 적용
    const initElements = document.querySelectorAll('a, img');
    initElements.forEach(initElement => applyStyle(initElement));

    return () => observer.disconnect();
  }, []);

  return (
    <BrowserRouter>
      <HelmetComponent />
      <TitleComponent />

      <React.Suspense fallback={<LoadingComponent />}>
        <Routes>
          {/* 기본 라우트 */}
          <Route index element={<><NoLoginNav /><LoginPage /></>} />

          {/* 비로그인 및 로그인 사용자용 - Nav가 분리된 페이지 */}
          <Route path="/login" element={<><NoLoginNav /><LoginPage /></>} />
          <Route path="/signup" element={<><NoLoginNav /><SignupPage /></>} />
          <Route path="/password" element={<><NoLoginNav /><ChangePwPage /></>} />
          <Route path="/information" element={<><NoLoginNav /><InformationPage /></>} />
          <Route path="/notice" element={<><NoLoginNav /><NoticePage /></>} />
          <Route path="/download" element={<><NoLoginNav /><DownloadPage /></>} />

          {/* 로그인 사용자용 - Nav가 분리된 페이지 */}
          <Route path="/users" element={<><YesLoginNav /><UserProfilePage /></>} />
          <Route path="/friends" element={<><YesLoginNav /><FriendListPage /></>} />
          <Route path="/senders" element={<><YesLoginNav /><SenderListPage /></>} />

          {/* 로그인 사용자용 - Nav가 병합된 페이지 */}
          <Route path="/memos" element={<MemoListPage />} />
          <Route path="/memos/:memoId" element={<ReadAndEditMemoPage />} />
          <Route path="/memos/new-memo" element={<NewMemoPage />} />

          {/* 404 Not Found 페이지 */}
          <Route path="*" element={<><NoLoginNav /><NotFoundPage /></>} />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
}

export default App;