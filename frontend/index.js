console.log("JS 연결됨!");

const form = document.querySelector("#mood-form");
const input = document.querySelector("#mood-input");
const output = document.querySelector("#quote-output");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const mood = input.value;

  try {
    const res = await fetch("http://localhost:8000/chat/philosophy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ mood })
    });

    const data = await res.json();
    output.innerText = data.quote;
    input.value = ""; // 입력창 초기화
  } catch (err) {
    output.innerText = "에러가 발생했습니다.";
    console.error(err);
  }
});