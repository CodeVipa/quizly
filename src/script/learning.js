async function loadModule(category){
  const res = await fetch("../src/data/questionBank.json");
  const data = res.json();

  const cat = data.categories.find(c => c.id === category)
  if(!cat) throw new Error("Category Not Found")
  const filtered = cat.questions.filter(q => q.hasImage !== true);

  return [...filtered]
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
}

/* =========================
   GO BACK
========================= */
function goBack() {
  document.getElementById("title").innerText = "Choose a learning module";
  document.getElementById("intro").style.display = "block";
  document.getElementById("backBtn").style.display = "none";
  document.getElementById("lesson").innerHTML = "";
}
