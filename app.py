import os
import logging
from flask import Flask, render_template, request, jsonify, send_from_directory
from dotenv import load_dotenv
from google import genai

# .env 파일에서 환경변수 로드
load_dotenv()

# 로깅 설정 (백엔드 로그 출력)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger(__name__)

# Flask 앱 인스턴스 생성
app = Flask(__name__)

# Gemini API 클라이언트 초기화 (.env의 GEMINI_API_KEY 사용)
gemini_api_key = os.getenv("GEMINI_API_KEY")
if not gemini_api_key:
    logger.warning("경고: GEMINI_API_KEY가 .env 파일에 설정되지 않았습니다!")
    client = None
else:
    client = genai.Client(api_key=gemini_api_key)


@app.route("/")
def index():
    """메인 화면을 렌더링합니다."""
    return render_template("index.html")


@app.route("/manifest.json")
def manifest():
    """PWA 웹 앱 매니페스트 제공"""
    return send_from_directory("static", "manifest.json", mimetype="application/manifest+json")


@app.route("/sw.js")
def service_worker():
    """PWA 서비스 워커 스크립트 제공 (루트 스코프 허용 헤더 포함)"""
    response = send_from_directory("static", "sw.js", mimetype="application/javascript")
    response.headers["Service-Worker-Allowed"] = "/"
    return response


@app.route("/generate", methods=["POST"])
def generate():
    """
    사용자가 입력한 정보를 바탕으로 Gemini AI를 호출하여
    Resume와 Portfolio 초안을 생성하는 API 엔드포인트
    """
    # 1. 요청 데이터 파싱
    data = request.get_json()
    if not data:
        logger.warning("[요청 오류] JSON 데이터가 비어 있습니다.")
        return jsonify({"error": "요청 데이터가 올바르지 않습니다."}), 400

    name = data.get("name", "").strip()
    job_title = data.get("job_title", "").strip()
    career = data.get("career", "").strip()
    projects = data.get("projects", "").strip()
    tone = data.get("tone", "자신감 있고 전문적인 톤").strip()
    prompt_type = data.get("prompt_type", "general").strip()  # 'general' (일반) 또는 'expert' (전문가)

    # 2. 백엔드 필수 입력값 유효성 검증
    if not name:
        return jsonify({"error": "이름을 입력해 주세요."}), 400
    if not job_title:
        return jsonify({"error": "지원 직무를 입력해 주세요."}), 400
    if not career:
        return jsonify({"error": "경력 사항을 입력해 주세요."}), 400
    if not projects:
        return jsonify({"error": "프로젝트 경험을 입력해 주세요."}), 400

    logger.info(
        f"[요청 수신] 이름={name}, 직무={job_title}, 프롬프트={prompt_type}, 톤={tone}"
    )

    # 3. API 키 설정 확인
    current_key = os.getenv("GEMINI_API_KEY") or gemini_api_key
    if not current_key or current_key == "your_gemini_api_key_here":
        logger.error("[인증 오류] 유효한 GEMINI_API_KEY가 .env에 설정되어 있지 않습니다.")
        return jsonify({
            "error": "서버에 유효한 GEMINI_API_KEY가 설정되지 않았습니다. .env 파일을 확인해 주세요."
        }), 500

    # 4. 프롬프트 엔지니어링 (Prompt A: 일반 vs Prompt B: 전문가)
    if prompt_type == "expert":
        system_instruction = (
            "당신은 글로벌 IT 기업의 수석 채용담당자이자 이력서 컨설턴트입니다. "
            "주어진 정보를 바탕으로 성과 중심(STAR 기법, 수치 지표 강조, 문제 해결 과정과 기술적 임팩트)을 부각하는 "
            "최고급 전문가 수준의 이력서(Resume)와 상세 포트폴리오(Portfolio)를 Markdown 형식으로 작성하세요."
        )
    else:
        system_instruction = (
            "당신은 친절하고 전문적인 커리어 코치입니다. "
            "주어진 정보를 바탕으로 읽기 쉽고 깔끔하며 균형 잡힌 "
            "표준 형식의 이력서(Resume)와 포트폴리오(Portfolio)를 Markdown 형식으로 작성하세요."
        )

    user_prompt = f"""
{system_instruction}

[작성 지침]
1. 어조 및 톤: {tone}
2. 언어: 한국어
3. 형식: 가독성이 뛰어난 Markdown 문법(#, ##, -, ** 등) 사용
4. 결과 구성:
   # [이름]의 이력서 (Resume)
   ## 한 줄 소개 및 프로필 요약
   ## 핵심 역량 (Core Competencies)
   ## 경력 사항 (Work Experience)
   ---
   # [이름]의 포트폴리오 (Portfolio)
   ## 주요 프로젝트 요약
   ## 프로젝트 상세 (프로젝트 개요, 담당 역할 및 기여도, 사용 기술, 문제 해결 경험, 최종 성과)

[사용자 입력 정보]
- 이름: {name}
- 지원 직무: {job_title}
- 경력 사항:
{career}
- 프로젝트 경험:
{projects}
"""

    # 5. Gemini API 호출 및 예외 처리
    try:
        active_client = genai.Client(api_key=current_key)
        response = active_client.models.generate_content(
            model="gemini-3.6-flash",
            contents=user_prompt
        )

        result_text = response.text
        if not result_text:
            logger.error("[응답 오류] Gemini API로부터 빈 응답을 받았습니다.")
            return jsonify({"error": "AI가 응답을 생성하지 못했습니다. 다시 시도해 주세요."}), 500

        logger.info(f"[생성 성공] {name}님의 이력서 및 포트폴리오 생성 완료 (길이: {len(result_text)}자)")
        return jsonify({"result": result_text}), 200

    except Exception as e:
        error_message = str(e)
        logger.error(f"[Gemini API 호출 실패] {error_message}")

        # 사용자 친화적인 에러 메시지 매핑
        if "API_KEY_INVALID" in error_message or "invalid api key" in error_message.lower():
            user_friendly_msg = "Gemini API 키가 올바르지 않습니다. .env 파일의 키를 다시 확인해 주세요."
        elif "RESOURCE_EXHAUSTED" in error_message or "quota" in error_message.lower():
            user_friendly_msg = "API 무료 사용량 한도를 초과했습니다. 잠시 후 다시 시도해 주세요."
        elif "PERMISSION_DENIED" in error_message:
            user_friendly_msg = "API 접근 권한이 없습니다. Google AI Studio에서 키 권한을 확인해 주세요."
        else:
            user_friendly_msg = f"AI 생성 중 오류가 발생했습니다: {error_message[:100]}"

        return jsonify({"error": user_friendly_msg}), 500


if __name__ == "__main__":
    logger.info("Flask 웹 서버를 시작합니다. (http://127.0.0.1:5000)")
    app.run(host="127.0.0.1", port=5000, debug=True)
