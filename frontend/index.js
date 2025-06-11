const form = document.querySelector("#mood-form");
const input = document.querySelector("#mood-input");
const output = document.querySelector("#quote-output");
const nicknameInput = document.querySelector("#nickname-input");

form.addEventListener("submit", async (e) => {
  console.log("폼 제출 시작됨");
  e.preventDefault();
  const mood = input.value;
  const nickname = nicknameInput.value;
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
    await fetch(`http://localhost:8000/save-quote?nickname=${encodeURIComponent(nickname)}&mood=${encodeURIComponent(mood)}`, {
      method: "POST"
    });


  } catch (err) {
    output.innerText = "에러가 발생했어요 😢";
    console.error(err);
  }

  input.value = "";
  input.focus();
});

document.querySelector("#load-history").addEventListener("click", async () => {
  const nickname = document.querySelector("#history-nickname").value;
  const output = document.querySelector("#history-output");

  output.innerHTML = "<li>불러오는 중...</li>";

  try {
    const res = await fetch(`http://localhost:8000/history?nickname=${encodeURIComponent(nickname)}`);
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
  }
});

// window.addEventListener("beforeunload", (e) => {
//   // 이 이벤트는 새로고침, 탭 닫기, 뒤로가기 모두에서 작동
//   e.preventDefault();
//   e.returnValue = ""; // 브라우저에서 기본 새로고침/이동 동작을 중단시킴
// });