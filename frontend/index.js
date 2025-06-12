const form = document.querySelector("#mood-form");
const input = document.querySelector("#mood-input");
const output = document.querySelector("#quote-output");
const nicknameInput = document.querySelector("#nickname-input");

// 폼 제출 이벤트 처리
form.addEventListener("submit", async (e) => {
  console.log("폼 제출 시작됨");
  e.preventDefault(); // 기본 폼 제출 동작 방지 (새로고침 방지)
  
  const mood = input.value.trim();
  const nickname = nicknameInput.value.trim();
  
  // 입력값 검증
  if (!mood || !nickname) {
    output.innerText = "닉네임과 기분을 모두 입력해주세요 🙏";
    return;
  }
  
  output.innerText = "생각 중...🤔";

  try {
    const res = await fetch("http://localhost:8000/chat/philosophy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ nickname, mood })
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    const lines = data.quote.split("\n").filter(Boolean);
    const [korean, english] = lines;

    output.innerHTML = `
      <p><strong>🧠 한국어 명언:</strong><br>${korean}</p>
      <p><strong>🌍 영어 명언:</strong><br>${english}</p>
    `;
    
    // 히스토리 저장
    await fetch(`http://localhost:8000/save-quote?nickname=${encodeURIComponent(nickname)}&mood=${encodeURIComponent(mood)}`, {
      method: "POST"
    });

  } catch (err) {
    output.innerText = "에러가 발생했어요 😢";
    console.error("API 호출 에러:", err);
  }

  // 입력 필드 초기화 및 포커스
  input.value = "";
  input.focus();
});

// 히스토리 로드 버튼 이벤트 처리
document.querySelector("#load-history").addEventListener("click", async (e) => {
  e.preventDefault(); // 버튼의 기본 동작 방지
  
  const nickname = document.querySelector("#history-nickname").value.trim();
  const output = document.querySelector("#history-output");

  if (!nickname) {
    output.innerHTML = "<li>닉네임을 입력해주세요.</li>";
    return;
  }

  output.innerHTML = "<li>불러오는 중...</li>";

  try {
    const res = await fetch(`http://localhost:8000/history?nickname=${encodeURIComponent(nickname)}`);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();

    if (!data.quotes || data.quotes.length === 0) {
      output.innerHTML = "<li>기록이 없습니다.</li>";
      return;
    }

    output.innerHTML = "";
    for (const item of data.quotes) {
      const li = document.createElement("li");
      li.innerText = `[${item.date}] ${item.mood} - ${item.quote.split("\n")[0]}`;
      output.appendChild(li);
    }
  } catch (err) {
    output.innerHTML = "<li>불러오기 실패 😢</li>";
    console.error("히스토리 로드 에러:", err);
  }
});

// 페이지 새로고침/이탈 방지 (선택사항)
let isFormSubmitting = false;

form.addEventListener("submit", () => {
  isFormSubmitting = true;
  // 폼 제출 완료 후 플래그 리셋
  setTimeout(() => {
    isFormSubmitting = false;
  }, 1000);
});

window.addEventListener("beforeunload", (e) => {
  // 폼 제출 중이 아닐 때만 새로고침 방지 경고 표시
  if (!isFormSubmitting) {
    e.preventDefault();
    e.returnValue = ""; // 브라우저에서 새로고침/이동 확인 대화상자 표시
  }
});

// Enter 키로 폼 제출 시에도 새로고침 방지 확실히 하기
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    form.dispatchEvent(new Event("submit"));
  }
});