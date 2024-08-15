# OnlineMemo - Frontend Refactoring
***&#8594;&nbsp;&nbsp;60x Speed Improvement***

### Project
- <a href="https://github.com/OnlineMemo">README.md</a>
- <a href="https://github.com/orgs/OnlineMemo/repositories?q=sort%3Aname-asc">FullStack Repo</a>

### Refactor
- <a href="https://github.com/OnlineMemo/frontend-web/issues/1">Github Issue</a>
- <a href="https://github.com/OnlineMemo/frontend-web/tree/5882c62ecf8e801c6045009a6c82fc5197cd556f">Before Code</a>&nbsp;&nbsp;/&nbsp;&nbsp;<a href="https://github.com/OnlineMemo/backend/tree/d90ba0052e07c23c4bbd5c85dd018515eb6ca80b">After Code</a>
- <a href="https://github.com/OnlineMemo/backend">Backend Refactor</a>

<details open>
    <summary><h3>&nbsp;Contents</h3></summary>

1. &nbsp;&nbsp;[📄 Summary](#-summary)
2. &nbsp;&nbsp;[📗 API](#-api)
3. &nbsp;&nbsp;[📈 Performance](#-performance)
</details>
<br>



## 📄 Summary

#### API 데이터 처리 방식 변경
- Backend 리팩토링에 따라 요청 및 응답 데이터 타입과 네이밍 수정.
- API를 상위 컴포넌트에서 호출하고, props로 하위 컴포넌트에 전달하는 방식으로 전환.
- API 호출 횟수를 최소화하고 구조를 개선하여 데이터 흐름이 최적화됨.

#### Axios Interceptor 적용
- API 호출 시 JWT 토큰을 헤더에 자동으로 추가하여 인증 프로세스를 간소화.
- JWT 토큰 만료 시, 자동으로 재발급 요청을 처리하고 새 토큰을 재세팅.

#### Refesh Token 추가 운용
- 기존 방식인 JWT Access Token만 운용 시, 6시간의 짧은 로그인 유지시간을 가지며 보안에 취약함.
- Access Token 만료 시, Refresh Token으로 재발급 받아 2주동안 로그인 유지가 가능하도록 보안을 강화.
- Access Token&nbsp;&nbsp;&#8594;&nbsp;&nbsp;Access Token + Refresh Token 함께 운용.

<br>



## 📗 API

**<a href="https://github.com/user-attachments/assets/128c819e-2424-487d-aac0-23611d68af1c">Before</a>**|**<a href="https://github.com/user-attachments/assets/4b60a166-ff46-4a0e-a14e-20bb2722273b">After</a>**
|:-----:|:-----:|
<img src="https://github.com/user-attachments/assets/128c819e-2424-487d-aac0-23611d68af1c" width="100%">|<img src="https://github.com/user-attachments/assets/4b60a166-ff46-4a0e-a14e-20bb2722273b" width="100%">
| -&nbsp;&nbsp;불필요하게 많은 API 호출로 성능 저하 발생<br> -&nbsp;&nbsp;사용자에게 userId가 자주 노출되어 보안성 저하| -&nbsp;&nbsp;RestFul URI 및 API 개수 단축으로 성능 향상<br> -&nbsp;&nbsp;Security Context 정보로 userId를 대체하여 보안성 향상|

<br>



## 📈 Performance

### Benchmark

**Before<br>(MemoPage - 30 memos)**|**After<br>(MemoPage - 30 memos)**
|-----|-----|
<img src="https://github.com/user-attachments/assets/72d75f87-f0a9-4860-bffc-eba280c949da" width="100%">|<img src="https://github.com/user-attachments/assets/85f2d5a2-574a-4046-82b1-a42c9cfff2c5" width="100%">
| -&nbsp;&nbsp;FE : 각각의 모든 하위 컴포넌트에서 API 다중 호출<br> -&nbsp;&nbsp;Result&nbsp;:&nbsp;&nbsp;Request = 91번&nbsp;&nbsp;&&nbsp;&nbsp;Finish Time = 11.27s| -&nbsp;&nbsp;FE : 상위 컴포넌트에서 API 호출 후 하위로 props 전달<br>-&nbsp;&nbsp;BE : 전체적인 비즈니스 로직 및 쿼리 개선<br> -&nbsp;&nbsp;Result&nbsp;:&nbsp;&nbsp;Request = 2번&nbsp;&nbsp;&&nbsp;&nbsp;Finish Time = 193ms<br><br> &#8594;&nbsp;&nbsp;불과 30개의 메모임에도, 무려 58.4배의 성능 개선<br> &#8594;&nbsp;&nbsp;Prod 재배포 시, 최소 60배 이상의 속도 향상 예상

<br>
