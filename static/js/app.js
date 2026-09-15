/* ==========================================================================
   AI Resume & Portfolio Builder 프론트엔드 스크립트
   초보자도 이해하기 쉽도록 기능별로 명확하게 주석을 작성했습니다.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // 1. 주요 HTML DOM 요소 참조
    const form = document.getElementById("resume-form");
    const nameInput = document.getElementById("name");
    const jobTitleInput = document.getElementById("job-title");
    const careerInput = document.getElementById("career");
    const projectsInput = document.getElementById("projects");
    const toneSelect = document.getElementById("tone");
    const generateBtn = document.getElementById("generate-btn");

    // 알림 및 결과 표시 영역
    const errorBox = document.getElementById("error-box");
    const errorText = document.getElementById("error-text");
    const loadingBox = document.getElementById("loading-box");
    const resultBox = document.getElementById("result-box");
    const resultContent = document.getElementById("result-content");
    const copyBtn = document.getElementById("copy-btn");
    const downloadBtn = document.getElementById("download-btn");
    const toastMsg = document.getElementById("toast-msg");

    // 2. 오류 메시지 표시 헬퍼 함수
    function showError(message) {
        errorText.textContent = message;
        errorBox.classList.remove("hidden");
    }

    // 3. 오류 메시지 숨기기 헬퍼 함수
    function hideError() {
        errorText.textContent = "";
        errorBox.classList.add("hidden");
    }

    // 4. 복사 알림 토스트 표시 함수
    function showToast(message = "클립보드에 복사되었습니다!") {
        toastMsg.textContent = message;
        toastMsg.classList.remove("hidden");
        setTimeout(() => {
            toastMsg.classList.add("hidden");
        }, 2500);
    }

    // 5. 폼 제출(Submit) 이벤트 처리
    form.addEventListener("submit", async (e) => {
        e.preventDefault(); // 기본 새로고침 방지
        hideError();

        // 사용자 입력값 읽기 및 공백 제거(trim)
        const name = nameInput.value.trim();
        const jobTitle = jobTitleInput.value.trim();
        const career = careerInput.value.trim();
        const projects = projectsInput.value.trim();
        const tone = toneSelect.value;
        const promptTypeElement = document.querySelector('input[name="prompt_type"]:checked');
        const promptType = promptTypeElement ? promptTypeElement.value : "general";

        // [프론트엔드 유효성 검증] 빈 값이 있는지 확인
        if (!name) {
            showError("이름을 입력해 주세요.");
            nameInput.focus();
            return;
        }
        if (!jobTitle) {
            showError("지원 직무를 입력해 주세요.");
            jobTitleInput.focus();
            return;
        }
        if (!career) {
            showError("경력 및 주요 활동 사항을 입력해 주세요.");
            careerInput.focus();
            return;
        }
        if (!projects) {
            showError("프로젝트 경험을 최소 1개 이상 입력해 주세요.");
            projectsInput.focus();
            return;
        }

        // 로딩 상태 시작 (버튼 비활성화 및 스피너 표시)
        generateBtn.disabled = true;
        generateBtn.textContent = "⏳ AI가 서류를 작성하는 중...";
        loadingBox.classList.remove("hidden");
        resultBox.classList.add("hidden");

        try {
            // Flask 백엔드의 /generate API 호출
            const response = await fetch("/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name,
                    job_title: jobTitle,
                    career: career,
                    projects: projects,
                    tone: tone,
                    prompt_type: promptType,
                }),
            });

            const data = await response.json();

            // 백엔드에서 오류 응답을 보낸 경우 (HTTP 4xx, 5xx)
            if (!response.ok) {
                const errorMessage = data.error || "이력서 생성 중 서버 오류가 발생했습니다.";
                showError(errorMessage);
                return;
            }

            // 생성 성공 시 결과 화면에 표시
            resultContent.textContent = data.result;
            resultBox.classList.remove("hidden");

            // 결과창으로 부드럽게 스크롤 이동
            resultBox.scrollIntoView({ behavior: "smooth", block: "start" });

        } catch (err) {
            // 네트워크 단절 또는 예기치 않은 자바스크립트 오류
            console.error("Fetch Error:", err);
            showError("서버와의 통신에 실패했습니다. Flask 서버가 켜져 있는지 확인해 주세요.");
        } finally {
            // 로딩 상태 해제 및 버튼 원상복구
            loadingBox.classList.add("hidden");
            generateBtn.disabled = false;
            generateBtn.textContent = "✨ AI 이력서 & 포트폴리오 생성하기";
        }
    });

    // 6. 결과 복사 버튼 클릭 이벤트
    copyBtn.addEventListener("click", async () => {
        const textToCopy = resultContent.textContent;
        if (!textToCopy) return;

        try {
            // 클립보드 복사 API 사용
            await navigator.clipboard.writeText(textToCopy);
            showToast("📋 클립보드에 전체 내용이 복사되었습니다!");
        } catch (err) {
            // 클립보드 API 미지원 브라우저용 대안
            const tempTextarea = document.createElement("textarea");
            tempTextarea.value = textToCopy;
            document.body.appendChild(tempTextarea);
            tempTextarea.select();
            document.execCommand("copy");
            document.body.removeChild(tempTextarea);
            showToast("📋 클립보드에 전체 내용이 복사되었습니다!");
        }
    });

    // 7. Markdown (.md) 파일 다운로드 버튼 클릭 이벤트
    downloadBtn.addEventListener("click", () => {
        const content = resultContent.textContent;
        if (!content) return;

        const name = nameInput.value.trim() || "사용자";
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const filename = `이력서_포트폴리오_${name}_${today}.md`;

        // 마크다운 파일 Blob 객체 생성
        const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
        const downloadUrl = URL.createObjectURL(blob);

        // 가상 <a> 태그를 만들어 브라우저 다운로드 트리거
        const tempLink = document.createElement("a");
        tempLink.href = downloadUrl;
        tempLink.download = filename;
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);

        // 메모리 해제
        URL.revokeObjectURL(downloadUrl);
        showToast(`💾 "${filename}" 파일로 다운로드되었습니다!`);
    });
});
