import React, { useState, useEffect, useMemo } from "react";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import styled from "styled-components";
import './App.css';
import LoadingNav from "./components/Navigation/LoadingNav";
import BasicWrapper from "./components/Styled/BasicWrapper";
import { retryLazy } from "./utils/lazyUtil.js"
import { parseToken } from "./utils/TokenUtil"
import { getTitle, getDescription, getCanonical } from "./utils/MetaUtil"
import BMJUAFont from './assets/fonts/BMJUA_ttf.woff2';

// Eager Suspense
import NoLoginNav from "./components/Navigation/NoLoginNav"
import LoginPage from "./pages/User/LoginPage"
import SignupPage from "./pages/User/SignupPage"
import NoticePage from "./pages/Etc/NoticePage"
import DownloadPage from "./pages/Etc/DownloadPage"
import GlobalModal from "./components/Modal/GlobalModal";

// Lazy Suspense
const LazyLoad = (path) => retryLazy(() => import(`${path}`));
const YesLoginNav = LazyLoad("./components/Navigation/YesLoginNav");
const ChangePwPage = LazyLoad("./pages/User/ChangePwPage");
const MemoListPage = LazyLoad("./pages/Memo/MemoListPage");
const InformationPage = LazyLoad("./pages/Etc/InformationPage");
const ReadAndEditMemoPage = LazyLoad("./pages/Memo/ReadAndEditMemoPage");
const NewMemoPage = LazyLoad("./pages/Memo/NewMemoPage");
const UserProfilePage = LazyLoad("./pages/User/UserProfilePage");
const FriendListPage = LazyLoad("./pages/Friend/FriendListPage");
const SenderListPage = LazyLoad("./pages/Friend/SenderListPage");
const NotFoundPage = LazyLoad("./pages/Etc/NotFoundPage");
const StatisticPage = LazyLoad("./pages/BackOffice/StatisticPage");


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

const FooterContainer = styled.footer`
    text-align: center;
    color: #463f3a;
    margin: 9px;
    line-height: 155%;
    /* font-family: "Kalam-Light"; */

    #footerUp {
        color: black;
        font-size: 1.2rem;
        font-family: "Kalam-Regular";
    }

    /* #footerDown {
        color: black;
        font-size: 1.2rem;
        font-family: "Kalam-Regular";
    } */
`;


// ============ < Sub Components > ============ //

const publicPages = new Set(['/', '/signup', '/password', '/information', '/notice', '/download', '/404']);  // '/login'은 이미 '/'로 치환되었으므로 제외
const authPages = new Set(['/users', '/friends', '/senders', '/memos', '/memos/:memoId', '/memos/new-memo']);
const redirectPages = new Set(['/', '/signup', '/password']);  // '/login'은 이미 '/'로 치환되었으므로 제외
const securedPages = new Set(['/statistics']);

const convertPathName = (originPathName) => {
  // 주소 끝에 '/'가 있으면 제거 (예: '/memos/' -> '/memos')
  let normalizedPathName = originPathName;
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
  const isInPublicPages = publicPages.has(normalizedPathName);
  const isInAuthPages = authPages.has(normalizedPathName);
  if (isInPublicPages === false && isInAuthPages === false) {
    normalizedPathName = '/404';
  }

  return {normalizedPathName, isInPublicPages, isInAuthPages};
}

function HelmetGa4Component() {
  const location = useLocation();
  const [isHasReload, setIsHasReload] = useState(false);
  const [prevPathName, setPrevPathName] = useState(null);  // prevPath
  const pathName = location?.pathname || "/";  // curPath

  // <!-- Google tag (gtag.js) - GA4 -->
  useEffect(() => {
    const isTest = false;  // Dev mode (in index.html, App.js)
    const checkIsTest = window.checkIsTest;
    if (checkIsTest !== undefined) {
      if (checkIsTest !== isTest) {  // 값일치여부 단순 비교용 (외부 인젝션 영향 X)
        console.error(`ERROR - GA4 isTest 불일치 에러\n==> (isTest1: ${checkIsTest}, isTest2: ${isTest})\n`);
      }
      else if (isTest === true) {
        console.warn(`WARN - GA4 isTest 활성화 경고\n==> (isTest1: true, isTest2: true)\n`);
      }
    }

    // << GA4 사용여부 검사 >>
    // 중복 경로의 이벤트 전송 방지
    if (!location?.pathname || pathName === prevPathName) return;
    setPrevPathName(pathName);  // 이는 다음 렌더링에서 반영됨.
    // Admin 유저의 이벤트 전송 방지 (ex. 백오피스 페이지)
    const { decodedId, isLoggedIn, isAdminUser } = parseToken();
    if (isAdminUser) return;
    if (securedPages.has(pathName) || securedPages.has(prevPathName)) return;
    // 새로고침 시 재전송 방지
    const navEntries = performance.getEntriesByType('navigation');
    const isReload = navEntries.length > 0 && navEntries[0].type === 'reload';
    if (isReload && !isHasReload) {
      setIsHasReload(true);
      return;
    }
    // GA4 비활성화 상태의 실행 방지
    if (!window.gtag || !window.isGa4Init || typeof window.gtag !== 'function') return;
    // 로컬 환경의 이벤트 전송 방지 (단, isTest==true 경우는 허용)
    const isLocalhost = isTest ? false : ['localhost', '127.0.0.1'].includes(window.location.hostname);
    if (isLocalhost === true) return;

    // << pathName 및 referrer 도출 >>
    // pathName 정규화
    const {normalizedPathName, isInPublicPages, isInAuthPages} = convertPathName(pathName);
    // 강제 메인 리다이렉트 시 도착 URL을 기존 경로로 설정
    let pageLocation = window.location.href;
    if (isLoggedIn === true && redirectPages.has(normalizedPathName) === true) {
      pageLocation = `${window.location.origin}${pathName}`;
    }
    // referrer 도출
    const referrer = document.referrer;
    let pageReferrer = null;
    if (prevPathName === null) {  // 온라인메모장 관련 페이지에 처음 접근한 경우
      if (!referrer) {  // '브라우저를 켜자마자 외부 페이지 없이 바로 진입한 경우' or 'http 및 localhost 이동 등으로 referrer 추적이 제한된 경우'
        pageReferrer = null;
      }
      else {  // '외부 페이지를 거쳐 유입된 경우' or '이전에 온라인메모장 로그아웃 후 메인페이지로 강제 리다이렉트된 경우'
        pageReferrer = referrer;
        const referrerUrl = new URL(referrer);
        if (referrerUrl.origin === window.location.origin) {
          const referrerPathName = referrerUrl.pathname;
          if (securedPages.has(referrerPathName)) return;  // 백오피스 로그아웃으로 메인페이지에 온 경우는 이벤트 미전송
        }
      }
    }
    else {  // 온라인메모장 서비스 내에서 라우팅중인 경우
      pageReferrer = `${window.location.origin}${prevPathName}`;
    }

    // << event 전송 >>
    setTimeout(() => {
      // null 값을 대체하여 전송 (string_value: "X", int_value: -1 or 0)
      pageReferrer = (pageReferrer !== null) ? pageReferrer : "X";  // '브라우저를 켜자마자 외부 페이지 없이 바로 진입한 경우' or 'http 및 localhost 이동 등으로 referrer 추적이 제한된 경우'
      let loginUserId = decodedId;  // 로그인 사용자id: 1~ (정상)
      if (loginUserId === null) {  // 비로그인 사용자인 경우
        if (isInPublicPages === true) {  // 비로그인 허용 페이지일 때
          loginUserId = 0;  // 비로그인 사용자id: 0 (정상)
        }
        else if (isInAuthPages === true) {  // 로그인 필수 페이지일 때
          loginUserId = -1;  // 비로그인 사용자id: -1 (비정상: '비로그인 유저가 잘못된 접근으로, 로그인 필수 페이지에 접근한 경우')
        }
        else {  // 예외 처리 (사실상 발생하지 않음)
          loginUserId = -1;  // 비로그인 사용자id: -1 (비정상: 잘못된 전송)
        }
      }

      // 전체 페이지의 통합 집계 (event)
      window.gtag('event', 'page_view', {
        page_path: normalizedPathName,
        page_location: pageLocation,
        page_referrer: pageReferrer,
        login_user_id: loginUserId,  // 로그인된 사용자id (커스텀 속성)
        is_debug_mode: isTest,  // 이는 GA4 세그먼트 및 BigQuery 필터링용으로 사용 예정. (커스텀 속성)
        is_manual_event: true,  // 수동으로 직접 전송한 이벤트인가? (커스텀 속성)
      });

      // 로그인 필수 페이지의 통합 집계 (event)
      if (isInAuthPages === true) {
        window.gtag('event', 'page_view', {
          page_path: '/auth-pages',
          page_location: pageLocation,
          page_referrer: pageReferrer,
          login_user_id: loginUserId,  // 로그인된 사용자id (커스텀 속성)
          is_debug_mode: isTest,  // 이는 GA4 세그먼트 및 BigQuery 필터링용으로 사용 예정. (커스텀 속성)
          is_manual_event: true,  // 수동으로 직접 전송한 이벤트인가? (커스텀 속성)
        });
      }

      // 라우팅 테스트용 디버깅 로그
      if (isTest === true) {
        let printPrevPathName = (prevPathName !== null) ? prevPathName : "X";
        if (prevPathName === null && pageReferrer !== "X") {
          try {
            const referrerUrl = new URL(pageReferrer);
            if (referrerUrl.origin === window.location.origin) {
              const referrerPathName = referrerUrl.pathname;
              printPrevPathName = referrerPathName;
            }
          } catch (err) {
            console.error(`ERROR - pageReferrer URL 파싱 에러\n==> (pageReferrer: ${pageReferrer})\n`);
          }
        }
        console.log('========================');
        console.log('- title :', document.title);  // (current)
        console.log('- pathName :', normalizedPathName);  // normalized pathName (current)
        console.log(`- Route pathName :\n${printPrevPathName} → ${pathName}`);  // original pathNames (prev -> current)
        console.log(`- Route fullURL :\n${pageReferrer} → ${pageLocation}`);  // (prev -> current)
      }
    }, 100);
  }, [location?.pathname]);

  return (
      <Helmet htmlAttributes={{ lang: "ko" }}>
        <title>{getTitle(pathName)}</title>
        <meta name="description" content={getDescription(pathName)} />
        <link rel="canonical" href={getCanonical(pathName)} />
        <link rel="preload" href={BMJUAFont} as="font" type="font/woff2" crossorigin="anonymous" />
      </Helmet>
  );
}

function TitleComponent() {  // 홈키
  const location = useLocation();
  const pathName = location?.pathname || "/";
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // hydration 오류(#418, #423) 해결 : 서버와 클라이언트의 렌더링 출력이 일치하도록 함.
    if (!location?.pathname) return;
    const isHasTokens = !!(localStorage.getItem("accessToken") && localStorage.getItem("refreshToken"));
    setIsLoggedIn(isHasTokens);
  }, [location?.pathname]);

  return (
      <MainTitleText>
        <Link
          id="mainTitleLink"
          to={
            isLoggedIn === true
              ? "/memos"
              : (pathName === "/" || pathName === "/login")
                  ? pathName
                  : "/"
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

// - hydration 오류 (#418, #423) 해결 :
// 이는 'SEO 크롤러에 노출된 SSR 페이지'를 제외하고, 'CSR 페이지'에만 적용할것.
// SSR 페이지는 즉시 렌더링하여, 서버와 클라이언트의 렌더링 출력이 일치하도록 해결함.
// CSR 페이지는 이 함수로 래핑해, 기존처럼 지연 로딩을 정상적으로 적용하면 됨.
const wrapSuspense = (children) => (  // for 'CSR 페이지'
  <React.Suspense fallback={<LoadingComponent />}>
    {children}
  </React.Suspense>
);

function RouteComponent() {
  const location = useLocation();
  const [isAdminUser, setIsAdminUser] = useState(false);

  const currentRoute = useMemo(() => {
    if (isAdminUser === true) {
      return (
        <Routes>
          <Route path="/statistics" element={wrapSuspense(<StatisticPage />)} />
          <Route path="*" element={<Navigate to="/statistics" replace />} />
        </Routes>
      );
    }

    return (
      <Routes>
        {/* 기본 라우트 */}
        <Route index element={<><NoLoginNav /><LoginPage /></>} />

        {/* 비로그인 및 로그인 사용자용 - Nav가 분리된 페이지 */}
        <Route path="/login" element={<><NoLoginNav /><LoginPage /></>} />
        <Route path="/signup" element={<><NoLoginNav /><SignupPage /></>} />
        <Route path="/password" element={wrapSuspense(<><NoLoginNav /><ChangePwPage /></>)} />
        <Route path="/information" element={wrapSuspense(<><NoLoginNav /><InformationPage /></>)} />
        <Route path="/notice" element={<><NoLoginNav /><NoticePage /></>} />
        <Route path="/download" element={<><NoLoginNav /><DownloadPage /></>} />

        {/* 로그인 사용자용 - Nav가 분리된 페이지 */}
        <Route path="/users" element={wrapSuspense(<><YesLoginNav /><UserProfilePage /></>)} />
        <Route path="/friends" element={wrapSuspense(<><YesLoginNav /><FriendListPage /></>)} />
        <Route path="/senders" element={wrapSuspense(<><YesLoginNav /><SenderListPage /></>)} />

        {/* 로그인 사용자용 - Nav가 병합된 페이지 */}
        <Route path="/memos" element={wrapSuspense(<MemoListPage />)} />
        <Route path="/memos/:memoId" element={wrapSuspense(<ReadAndEditMemoPage />)} /> {/* 또는 path="/memos/:memoId(\d+) 정규표현식 적용할것. */}
        <Route path="/memos/new-memo" element={wrapSuspense(<NewMemoPage />)} />

        {/* 404 Not Found 페이지 - GA4 이벤트 단일 */}
        <Route path="*" element={wrapSuspense(<><NoLoginNav /><NotFoundPage /></>)} />

        {/* 404 Not Found 페이지 - GA4 이벤트 중복 */}
        {/* <Route path="/404" element={wrapSuspense(<><NoLoginNav /><NotFoundPage /></>)} />
        <Route path="*" element={<Navigate to="/404" replace />} /> */}
      </Routes>
    );
  }, [isAdminUser]);

  useEffect(() => {
    if (!location?.pathname) return;
    setIsAdminUser(parseToken().isAdminUser);
  }, [location?.pathname]);

  return currentRoute;
}

function App(props) {
  /* const [isCrawlTime, setIsCrawlTime] = useState(true);  // SSR hydration 크롤러가 첫 렌더링 중일때 */

  useEffect(() => {
    /* setIsCrawlTime(false); */

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
      
      <RouteComponent />
      {/*
        {isCrawlTime === true ? (  // hydration 오류(#418, #423) 해결 : 서버와 클라이언트의 렌더링 출력이 일치하도록 함.
          <RouteComponent />
        ) : (
          <React.Suspense fallback={<LoadingComponent />}>
            <RouteComponent />
          </React.Suspense>
        )}
      */}

      <FooterContainer>
        <span id="footerUp">
            <br className="disablePreviewAndDrag" />
            <br className="disablePreviewAndDrag" />
            <strong>
              Copyright 2023-2025. SAHYUNJIN. all rights reserved.
            </strong>
            <br />
        </span>
        {/* <span id="footerDown">
        </span> */}
      </FooterContainer>

      <GlobalModal />
    </>
  );
}

export default App;