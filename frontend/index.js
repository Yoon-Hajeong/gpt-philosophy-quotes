const form = document.querySelector("#mood-form");
const input = document.querySelector("#mood-input");
const output = document.querySelector("#quote-output");
const nicknameInput = document.querySelector("#nickname-input");

form.addEventListener("submit", async (e) => {
  e.preventDefault(); // 폼 기본 동작 막기
  console.log("폼 제출 시작됨");

  const mood = input.value.trim();
  const nickname = nicknameInput.value.trim();

  // 공백이면 경고 출력
  if (!mood || !nickname) {
    output.innerText = "닉네임과 기분을 모두 입력해주세요.";
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

    const data = await res.json();
    const lines = data.quote.split("\n").filter(Boolean);
    const [korean, english] = lines;

    output.innerHTML = `
      <p><strong>🧠 한국어 명언:</strong><br>${korean}</p>
      <p><strong>🌍 영어 명언:</strong><br>${english}</p>
    `;

    // GPT 응답 끝난 다음에 비우기 (여기만!)
    input.value = "";
    nicknameInput.value = "";

    // 콘솔 확인용
    console.log("입력창 비웠음 ✅");

    await fetch(`http://localhost:8000/save-quote?nickname=${encodeURIComponent(nickname)}&mood=${encodeURIComponent(mood)}`, {
      method: "POST"
    });

  } catch (err) {
    output.innerText = "에러가 발생했어요 😢";
    console.error(err);
  }
});
