import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import styled from "styled-components";
import './App.css';
import LoadingNav from "./components/Navigation/LoadingNav";
import BasicWrapper from "./components/Styled/BasicWrapper";
import { retryLazy } from "./utils/lazyUtil.js"
import { ParseToken } from "./utils/ParseToken"
import { getTitle, getDescription, getCanonical } from "./utils/MetaUtil"

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


// ============ < Styled Components > ============ //

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


// ============ < Sub Components > ============ //

function HelmetGa4Component() {
  const location = useLocation();
  const pathName = location?.pathname || "/";
  const isTest = false;  // Dev mode

  // <!-- Google tag (gtag.js) - GA4 -->
  useEffect(() => {
    if (!window.gtag || !location?.pathname) return;
    const isLocalhost = isTest ? false : (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    if (!(!isLocalhost && typeof window.gtag === 'function')) return;

    // 주소 끝에 '/'가 있으면 제거 (예: '/memos/' -> '/memos')
    let normalizedPathName = pathName;
    if (normalizedPathName && normalizedPathName.length >= 2 && normalizedPathName.endsWith('/')) {
      normalizedPathName = normalizedPathName.slice(0, -1);  
    }
    // '/login' 주소이면 '/'로 통합 집계
    if (normalizedPathName === '/login') {
      normalizedPathName = '/';
    }
    // '/memos/${memoId}' 패턴이면 '/memos/:memoId'로 통합 집계
    normalizedPathName = normalizedPathName.replace(/^\/memos\/\d+$/, '/memos/:memoId');
    // 잘못된 주소라면 '/404'로 통합 집계
    const publicPages = ['/', '/signup', '/password', '/information', '/notice', '/download', '/404'];  // '/login'은 이미 '/'로 치환되었으므로 제외.
    const authPages = ['/users', '/friends', '/senders', '/memos', '/memos/:memoId', '/memos/new-memo'];
    const isIncludePublicPages = publicPages.includes(normalizedPathName);
    const isIncludeAuthPages = authPages.includes(normalizedPathName);
    if (isIncludePublicPages === false && isIncludeAuthPages === false) {
      normalizedPathName = '/404';
    }

    // 전체 페이지의 통합 집계 (event)
    setTimeout(() => {
      if (isTest === true) {
        console.log('========================');
        console.log('- pathName :', normalizedPathName);
        console.log('- title :', document.title);
      }
      window.gtag('event', 'page_view', {
        page_path: normalizedPathName,
        page_location: window.location.href
      });
    }, 100);

    // 로그인 필수 페이지의 통합 집계 (event)
    let loginUserId = ParseToken();
    if (loginUserId === null) loginUserId = 0;  // 만약 비로그인 사용자라면, 사용자id를 0으로 설정. (잘못된 접근)
    setTimeout(() => {
      if (isIncludeAuthPages === true) {
        window.gtag('event', 'page_view', {
          page_path: '/auth-pages',
          page_location: window.location.href,
          login_user_id: loginUserId  // 커스텀 속성
        });
      }
    }, 100);
  }, [location?.pathname]);

  return (
      <Helmet>
        <title>{getTitle(pathName)}</title>
        <meta name="description" content={getDescription(pathName)} />
        <link rel="canonical" href={getCanonical(pathName)} />
      </Helmet>
  );
}

function TitleComponent() {  // 홈키
  const location = useLocation();
  const pathName = location.pathname || "/";
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {  // hydration 오류(#418, #423) 해결 : 서버와 클라이언트의 렌더링 출력이 일치하도록 함.
    const isHasTokens = !!(localStorage.getItem("accessToken") && localStorage.getItem("refreshToken"));
    setIsLoggedIn(isHasTokens);
  }, []);

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


// ============ < Main Component > ============ //

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

function RouteComponent() {
  return (
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
      <Route path="/memos/:memoId" element={<ReadAndEditMemoPage />} /> {/* 또는 path="/memos/:memoId(\d+) 정규표현식 적용할것. */}
      <Route path="/memos/new-memo" element={<NewMemoPage />} />

      {/* 404 Not Found 페이지 */}
      <Route path="*" element={<><NoLoginNav /><NotFoundPage /></>} />
    </Routes>
  );
}

function App(props) {
  const [isCrawlTime, setIsCrawlTime] = useState(true);  // SSR hydration 크롤러가 첫 렌더링 중일때

  useEffect(() => {
    setIsCrawlTime(false);

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
    <>
      <HelmetGa4Component />
      <TitleComponent />

      {isCrawlTime === true ? (  // hydration 오류(#418, #423) 해결 : 서버와 클라이언트의 렌더링 출력이 일치하도록 함.
        <RouteComponent />
      ) : (
        <React.Suspense fallback={<LoadingComponent />}>
          <RouteComponent />
        </React.Suspense>
      )}
    </>
  );
}

export default App;