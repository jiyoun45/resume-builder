# 🚀 AI Resume & Portfolio Builder

사용자의 기본 정보, 경력 사항, 프로젝트 경험을 입력받아 **Google Gemini AI**를 통해 전문적이고 구조화된 **이력서(Resume)**와 **포트폴리오(Portfolio)** 초안을 자동으로 생성해 주는 웹 애플리케이션입니다.

---

## 📌 주요 기능

1. **간편한 사용자 입력 폼**
   - 기본 정보(이름, 지원 직무)
   - 경력 및 주요 활동 사항
   - 프로젝트 상세 경험 (역할, 사용 기술, 문제 해결, 성과 등)

2. **어조 및 문체(Tone) 맞춤 설정**
   - 자신감 있고 전문적인 톤
   - 간결하고 핵심 위주의 담백한 톤
   - 열정적이고 적극적인 성장형 톤
   - 격식 있고 신뢰감을 주는 학술적 톤

3. **프롬프트 모드 분기 (Prompt A / B)**
   - **Prompt A (일반형)**: 가독성이 높고 균형 잡힌 표준 이력서 & 포트폴리오
   - **Prompt B (전문가형)**: 수치 지표, STAR 기법(상황-과제-행동-결과), 문제 해결 임팩트 중심의 심화 서술

4. **구조화된 Markdown 결과 제공**
   - 한 줄 소개 및 프로필 요약
   - 핵심 역량 (Core Competencies)
   - 경력 사항 (Work Experience)
   - 프로젝트 상세 분석 (개요, 담당 역할, 기술 스택, 트러블슈팅, 최종 성과)

5. **사용자 편의 기능**
   - 생성 중 로딩 인디케이터
   - 생성 결과 즉시 복사(클립보드 Copy) 기능
   - 직관적인 오류 메시지 안내 (API 키 오류, 사용량 초과 등)

---

## 🛠 기술 스택

- **Backend**: Python 3, [Flask](https://flask.palletsprojects.com/), `google-genai` (Gemini SDK), `python-dotenv`
- **Frontend**: HTML5, Vanilla JavaScript, CSS3
- **AI Model**: Google Gemini (`gemini-3.6-flash`)

---

## 📁 디렉토리 구조

```text
resume-builder/
├── app.py               # Flask 백엔드 서버 & Gemini API 프롬프트 로직
├── requirements.txt     # 파이썬 의존성 패키지 목록
├── .env                 # API 키 등 환경변수 설정 파일 (git 미포함 권장)
├── .env.example         # 환경변수 예시 파일
├── templates/
│   └── index.html       # 메인 웹 페이지 템플릿
├── static/
│   ├── css/
│   │   └── style.css    # 애플리케이션 스타일시트
│   └── js/
│       └── app.js       # 비동기 요청 및 UI 인터랙션 스크립트
└── README.md            # 프로젝트 문서
```

---

## 🚀 빠른 시작 (Getting Started)

### 1. 사전 요구사항
- Python 3.9 이상
- Google Gemini API Key ([Google AI Studio](https://aistudio.google.com/)에서 무료 발급 가능)

### 2. 가상환경 생성 및 활성화 (macOS/Linux)

```bash
# 프로젝트 디렉토리로 이동
cd /Users/kimjiyoun/AI-study/resume-builder

# 가상환경 생성 (최초 1회만 필요)
python3 -m venv venv

# 가상환경 활성화
source venv/bin/activate
```

> **Windows 환경일 경우:**
> ```cmd
> venv\Scripts\activate
> ```

### 3. 필수 패키지 설치

```bash
pip install -r requirements.txt
```

### 4. 환경 변수 설정 (`.env`)

프로젝트 루트 디렉토리에 `.env` 파일을 만들고 발급받은 Gemini API 키를 입력합니다.

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 5. 웹 서버 실행

```bash
python app.py
```

서버가 실행되면 웹 브라우저에서 아래 주소로 접속합니다:
👉 **[http://127.0.0.1:5000](http://127.0.0.1:5000)** (또는 `http://localhost:5000`)

---

## 📝 사용 방법

1. 메인 페이지에서 **이름**, **지원 직무**, **경력 사항**, **프로젝트 경험**을 입력합니다.
2. 원하는 **문체(Tone)**와 **작성 모드(일반형 또는 전문가형)**를 선택합니다.
3. **'✨ AI 이력서 & 포트폴리오 생성하기'** 버튼을 클릭합니다.
4. 생성이 완료되면 화면에 출력된 마크다운 서류를 확인하고, **복사하기** 버튼을 눌러 활용합니다.

---

## ⚠️ 주의사항

- `.env` 파일에 저장된 API 키는 외부에 유출되지 않도록 주의해 주세요 (`.gitignore`에 추가 권장).
- Gemini API 무료 티어(Free Tier) 사용 시 분당 요청 수(RPM/TPM) 제한이 있을 수 있습니다.
