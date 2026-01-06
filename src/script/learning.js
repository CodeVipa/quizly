let allQuestions = [];
let currentPage = 1;
const pageSize = 20;
let currentCategory = "";

async function loadModule(category) {
  const res = await fetch("../src/data/questionBank.json");
  const data = await res.json();

  const cat = data.categories.find(c => c.id === category);
  if (!cat) throw new Error("Category Not Found");

  return cat.questions.filter(q => q.hasImage !== true);
}

async function displayMaterials(category) {
  currentCategory = category;
  currentPage = 1;

  document.getElementById("intro").style.display = "none";
  document.getElementById("backBtn").style.display = "block";
  document.getElementById("controls").classList.remove("hidden");
  document.getElementById("title").innerText = "Learning Module";

  allQuestions = await loadModule(category);
  renderPage();
}

function applyFilters() {
  currentPage = 1;
  renderPage();
}

function renderPage() {
  const lesson = document.getElementById("topics");
  lesson.innerHTML = "";

  const search = document.getElementById("searchInput").value.toLowerCase();
  const difficulty = document.getElementById("difficultyFilter").value;

  let filtered = allQuestions.filter(q => {
    const matchText = q.question.toLowerCase().includes(search);
    const matchDifficulty =
      difficulty === "all" || q.difficulty === difficulty;
    return matchText && matchDifficulty;
  });

  const start = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  pageItems.forEach((q, index) => {
const card = document.createElement("div");
card.className = "faq-card";

card.innerHTML = `
  <div class="faq-header" onclick="toggleFaq(this)">
    <h3>${start + index + 1}. ${q.question}</h3>
    <span class="faq-toggle">+</span>
  </div>

  <div class="faq-content">
    <div class="answer">
      <span>Answer:</span> ${q.answer}
    </div>
    <div>
      <strong>Explanation:</strong>
      <p>${q.explanation}</p>
    </div>
  </div>
`;


    lesson.appendChild(card);
  });

  renderPagination(filtered.length);
}

function toggleFaq(header) {

  const content = header.nextElementSibling;
  const icon = header.querySelector(".faq-toggle");

  content.classList.toggle("open");
  icon.textContent = content.classList.contains("open") ? "−" : "+";
}


function renderPagination(total) {
  const lesson = document.getElementById("topics");

  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return;

  const nav = document.createElement("div");
  nav.className = "button-container";

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = `
      px-4 py-2 rounded-lg border
      ${i === currentPage
        ? "active"
        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"}
    `;
    btn.onclick = () => {
      currentPage = i;
      renderPage();
    };
    nav.appendChild(btn);
  }

  lesson.appendChild(nav);
}

function goToQuiz() {
  window.location.href = `quiz.html?category=${currentCategory}`;
}

function goBack() {
  document.getElementById("title").innerText = "Choose a learning module";
  document.getElementById("intro").style.display = "block";
  document.getElementById("backBtn").style.display = "none";
  document.getElementById("controls").classList.add("hidden");
  document.getElementById("topics").innerHTML = "";
}
