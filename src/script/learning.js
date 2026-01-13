let allQuestions = [];
let currentPage = 1;
const pageSize = 20;
let currentCategory = "";


function saveProgress() {
  localStorage.setItem(
    `learning-progress-${currentCategory}`,
    JSON.stringify(allQuestions)
  );
}

function loadProgress(category, questions) {
  const saved = localStorage.getItem(`learning-progress-${category}`);
  if (!saved) return questions;

  const savedQs = JSON.parse(saved);

  return questions.map(q => {
    const match = savedQs.find(s => s.id === q.id);
    return match ? match : q;
  });
}


async function loadModule(category) {
  const res = await fetch("../src/data/questionBank.json");
  const data = await res.json();

  const cat = data.categories.find(c => c.id === category);
  if (!cat) throw new Error("Category Not Found");

  const questions = shuffleArray(
    cat.questions
      .filter(q => q.hasImage !== true)
      .map(q => ({ ...q, isRead: q.isRead ?? false }))
  );


  return loadProgress(category, questions);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}


async function loadDashboard() {
  const res = await fetch("../src/data/questionBank.json");
  const data = await res.json();

  let total = 0;
  let read = 0;

  data.categories.forEach(cat => {
    const saved = localStorage.getItem(`learning-progress-${cat.id}`);
    if (saved) {
      const qs = JSON.parse(saved);
      total += qs.length;
      read += qs.filter(q => q.isRead).length;
    } else {
      total += cat.questions.length;
    }
  });

  const percent = total ? Math.round((read / total) * 100) : 0;

  document.getElementById("stat-total").innerText = total;
  document.getElementById("stat-read").innerText = read;
  document.getElementById("stat-percent").innerText = percent + "%";
}


async function displayMaterials(category) {
  currentCategory = category;
  currentPage = 1;

  document.getElementById("intro").style.display = "none";
  document.getElementById("dashboard").style.display = "none";
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
  const container = document.getElementById("topics");
  container.innerHTML = "";

  const search = document.getElementById("searchInput").value.toLowerCase();
  const difficulty = document.getElementById("difficultyFilter").value;

  const filtered = allQuestions.filter(q => {
    return (
      q.question.toLowerCase().includes(search) &&
      (difficulty === "all" || q.difficulty === difficulty)
    );
  });

  const start = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  pageItems.forEach((q, index) => {
    const card = document.createElement("div");
    card.className = `faq-card ${q.isRead ? "read" : ""}`;
    card.dataset.id = q.id;

    card.innerHTML = `
      <div class="faq-header">
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

    const header = card.querySelector(".faq-header");
    header.onclick = () => toggleFaq(card, q);

    container.appendChild(card);
  });

  renderPagination(filtered.length);
  updateProgressUI();
}


function toggleFaq(card, question) {
  const content = card.querySelector(".faq-content");
  const icon = card.querySelector(".faq-toggle");

  const isOpen = content.classList.toggle("open");
  icon.textContent = isOpen ? "−" : "+";

  if (isOpen && !question.isRead) {
    question.isRead = true;
    card.classList.add("read");
    saveProgress();
    updateProgressUI();
  }
}


function renderPagination(total) {
  const container = document.getElementById("topics");
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return;

  const nav = document.createElement("div");
  nav.className = "button-container";

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = i === currentPage ? "active" : "";
    btn.onclick = () => {
      currentPage = i;
      renderPage();
    };
    nav.appendChild(btn);
  }

  container.appendChild(nav);
}


function updateProgressUI() {
  const read = allQuestions.filter(q => q.isRead).length;
  const total = allQuestions.length;
  const percent = total ? Math.round((read / total) * 100) : 0;

  document.getElementById("progress-bar").style.width = percent + "%";
  document.getElementById("progress-text").innerText =
    `Read ${read} of ${total} (${percent}%)`;
}


function goToQuiz() {
  window.location.href = `quiz.html?category=${currentCategory}`;
}

function goBack() {
  document.getElementById("title").innerText = "Choose a learning module";
  document.getElementById("intro").style.display = "block";
  document.getElementById("dashboard").style.display = "grid";
  document.getElementById("backBtn").style.display = "none";
  document.getElementById("controls").classList.add("hidden");
  document.getElementById("topics").innerHTML = "";
  loadDashboard();
}


loadDashboard();
