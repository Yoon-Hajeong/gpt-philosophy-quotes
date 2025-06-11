const form = document.querySelector("#mood-form");
const input = document.querySelector("#mood-input");
const output = document.querySelector("#quote-output");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const mood = input.value;
  output.innerText = "생각 중...🤔";

  try {
    const res = await fetch("http://localhost:8000/chat/philosophy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ mood })
    });

    const data = await res.json();
    const lines = data.quote.split("\n").filter(Boolean);
    const [korean, english] = lines;

    output.innerHTML = `
      <p><strong>🧠 한국어 명언:</strong><br>${korean}</p>
      <p><strong>🌍 영어 명언:</strong><br>${english}</p>
    `;
  } catch (err) {
    output.innerText = "에러가 발생했어요 😢";
    console.error(err);
  }

  input.value = "";
  input.focus();
});
