// History Quiz: grade selection -> 5-question round -> score + review (history-only topics)

(function () {
  // Utilities
  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  function choice(arr) { return arr[randInt(0, arr.length - 1)]; }
  function buildOptionsFrom(correct, distractors) {
    const norm = (v) => String(v).trim();
    const c = norm(correct);
    const uniquePool = Array.from(new Set(distractors.map(norm))).filter(d => d !== c && d.length > 0);
    const generic = ["None of these", "Not applicable", "Unknown", "N/A", "Other"];
    while (uniquePool.length < 3) {
      const g = generic.find(x => !uniquePool.includes(x) && x !== c);
      if (!g) break;
      uniquePool.push(g);
    }
    shuffle(uniquePool);
    const chosen = uniquePool.slice(0, 3);
    const options = shuffle([c, ...chosen]);
    return { options, correctIndex: options.indexOf(c) };
  }
  function pickFromPool(item) {
    const { options, correctIndex } = buildOptionsFrom(item.correct, item.d);
    return { q: item.q, options, correctIndex };
  }

  // History topic pools by grade (Basic facts, Monuments, People, Places, Timelines)
  const pools = {
    g1: {
      basics: [
        { q: "Stories about the past are called", correct: "History", d: ["Math", "Science", "Music", "Art"] },
        { q: "People who study the past are called", correct: "Historians", d: ["Doctors", "Chefs", "Painters", "Pilots"] },
        { q: "A place where old things are kept and shown is a", correct: "Museum", d: ["Bakery", "Garage", "Playground", "Hotel"] }
      ],
      monuments: [
        { q: "Which is an old monument?", correct: "Pyramids of Giza", d: ["Skyscraper", "Bus stop", "Playground", "Garage"] },
        { q: "Which is a famous tower?", correct: "Eiffel Tower", d: ["Water tower", "Clock", "Lighthouse", "Treehouse"] }
      ],
      people: [
        { q: "Who travels to discover new places?", correct: "Explorer", d: ["Builder", "Driver", "Singer", "Baker"] },
        { q: "A person who leads a country is a", correct: "President", d: ["Teacher", "Coach", "Farmer", "Singer"] }
      ],
      places: [
        { q: "Ancient Egypt is famous for its", correct: "Pyramids", d: ["Subways", "Skyscrapers", "Theme parks", "Factories"] },
        { q: "The Great Wall is in", correct: "China", d: ["France", "Brazil", "Kenya", "Canada"] }
      ],
      timelines: [
        { q: "The time before you were born is the", correct: "Past", d: ["Future", "Present", "Now", "Holiday"] }
      ]
    },
    g2: {
      basics: [
        { q: "A list of events in order is called a", correct: "Timeline", d: ["Recipe", "Calendar only", "Map", "Index"] },
        { q: "Old objects from the past are called", correct: "Artifacts", d: ["Garbage", "Toys", "Snacks", "Tools only"] }
      ],
      monuments: [
        { q: "The Taj Mahal is in", correct: "India", d: ["Italy", "Japan", "Mexico", "Spain"] },
        { q: "Machu Picchu is in", correct: "Peru", d: ["Egypt", "France", "Russia", "Canada"] }
      ],
      people: [
        { q: "Who was the first President of the USA?", correct: "George Washington", d: ["Abraham Lincoln", "John Adams", "Thomas Jefferson", "Theodore Roosevelt"] },
        { q: "An ancient ruler of Egypt was called a", correct: "Pharaoh", d: ["King only", "Knight", "Duke", "Captain"] }
      ],
      places: [
        { q: "The Colosseum is in", correct: "Rome", d: ["Paris", "Athens", "Cairo", "Berlin"] },
        { q: "The Acropolis is in", correct: "Athens", d: ["Rome", "Madrid", "Lisbon", "Oslo"] }
      ],
      timelines: [
        { q: "What do historians use to study the past?", correct: "Primary sources", d: ["Dreams", "Guesses", "Wishes", "Songs"] }
      ]
    },
    g3: {
      basics: [
        { q: "People who dig up artifacts are called", correct: "Archaeologists", d: ["Geologists", "Astronomers", "Biologists", "Meteorologists"] },
        { q: "A written record of daily events is a", correct: "Diary", d: ["Map", "Chart", "Sculpture", "Monument"] }
      ],
      monuments: [
        { q: "Stonehenge is in", correct: "United Kingdom", d: ["United States", "India", "China", "Italy"] },
        { q: "Petra is in", correct: "Jordan", d: ["Greece", "Egypt", "Turkey", "Morocco"] }
      ],
      people: [
        { q: "Who is known for nonviolent protest in India?", correct: "Mahatma Gandhi", d: ["Nelson Mandela", "Martin Luther King Jr.", "Jawaharlal Nehru", "Subhas Chandra Bose"] },
        { q: "Who sailed across the Atlantic in 1492?", correct: "Christopher Columbus", d: ["Vasco da Gama", "Ferdinand Magellan", "James Cook", "Marco Polo"] }
      ],
      places: [
        { q: "The ancient city of Pompeii is in", correct: "Italy", d: ["Egypt", "Iraq", "Spain", "France"] },
        { q: "The Great Sphinx is near", correct: "Giza", d: ["Athens", "Rome", "Beijing", "Kyoto"] }
      ],
      timelines: [
        { q: "An event that starts a new era is often called a", correct: "Turning point", d: ["Rest day", "Shortcut", "Bypass", "Detour"] }
      ]
    }
  };

  // Generators to add variety
  function extendPool(arr, gen, count) { for (let i = 0; i < count; i++) arr.push(gen()); }

  function genG1Basics() {
    const items = [
      { q: "A very old story passed down is a", correct: "Legend", d: ["Recipe", "Weather", "Cartoon", "Calendar"] },
      { q: "Old coins and tools found underground are", correct: "Artifacts", d: ["Garbage", "Food", "Plants", "Animals"] }
    ];
    return choice(items);
  }
  function genG2People() {
    const items = [
      { q: "Who freed many enslaved people via the Underground Railroad?", correct: "Harriet Tubman", d: ["Rosa Parks", "Susan B. Anthony", "Sojourner Truth", "Eleanor Roosevelt"] },
      { q: "Who was a famous nurse in the Crimean War?", correct: "Florence Nightingale", d: ["Marie Curie", "Amelia Earhart", "Ada Lovelace", "Jane Austen"] }
    ];
    return choice(items);
  }
  function genG3Places() {
    const pairs = [
      ["France", "Versailles"], ["China", "Forbidden City"], ["Cambodia", "Angkor Wat"], ["Mexico", "Chichen Itza"]
    ];
    const [country, site] = choice(pairs);
    const distractors = pairs.filter(p => p[1] !== site).map(p => p[1]).concat(["Alhambra", "Neuschwanstein"]);
    return { q: `Which site is in ${country}?`, correct: site, d: distractors };
  }

  // Extend pools for richness
  extendPool(pools.g1.basics, genG1Basics, 8);
  extendPool(pools.g2.people, genG2People, 8);
  extendPool(pools.g3.places, genG3Places, 8);

  // Build question bank with balanced sampling across topics
  function buildBalanced(target, topicArrays) {
    const out = [];
    const all = topicArrays.map(a => shuffle([...a]));
    let i = 0;
    while (out.length < target) {
      const topicIdx = i % all.length;
      const topic = all[topicIdx];
      if (topic.length) {
        const item = topic.pop();
        out.push(pickFromPool(item));
      }
      i++;
      if (i > 1000) break; // safety
    }
    return out.slice(0, target);
  }

  const questionBank = {
    grade1: buildBalanced(50, [pools.g1.basics, pools.g1.monuments, pools.g1.people, pools.g1.places, pools.g1.timelines]),
    grade2: buildBalanced(50, [pools.g2.basics, pools.g2.monuments, pools.g2.people, pools.g2.places, pools.g2.timelines]),
    grade3: buildBalanced(50, [pools.g3.basics, pools.g3.monuments, pools.g3.people, pools.g3.places, pools.g3.timelines])
  };

  // DOM elements
  const els = {
    setup: document.getElementById("historyQuizSetup"),
    select: document.getElementById("historyGradeSelect"),
    startBtn: document.getElementById("historyStartQuizBtn"),
    container: document.getElementById("historyQuizContainer"),
    question: document.getElementById("historyQuizQuestion"),
    options: document.getElementById("historyQuizOptions"),
    progress: document.getElementById("historyQuizProgress"),
    submitBtn: document.getElementById("historyQuizSubmitBtn"),
    result: document.getElementById("historyQuizResult"),
    score: document.getElementById("historyQuizScore"),
    review: document.getElementById("historyQuizReview"),
    playAgain: document.getElementById("historyQuizPlayAgain"),
    changeGrade: document.getElementById("historyQuizChangeGrade")
  };

  const state = {
    gradeKey: null,
    questions: [],
    current: 0,
    score: 0,
    answers: []
  };

  function setView({ setup = false, quiz = false, result = false }) {
    els.setup.style.display = setup ? "grid" : "none";
    els.container.style.display = quiz ? "block" : "none";
    els.result.style.display = result ? "block" : "none";
  }

  function pickQuestions(gradeKey) {
    const bank = questionBank[gradeKey] || [];
    const pool = shuffle([...bank]);
    const seen = new Set();
    const out = [];
    for (const item of pool) {
      if (!seen.has(item.q)) {
        seen.add(item.q);
        out.push(item);
        if (out.length === 5) break;
      }
    }
    return out;
  }

  function renderQuestion() {
    const q = state.questions[state.current];
    if (!q) return;
    els.question.textContent = q.q;
    els.progress.textContent = `Question ${state.current + 1} of ${state.questions.length}`;
    els.submitBtn.disabled = true;
    els.submitBtn.textContent = state.current === state.questions.length - 1 ? "Finish" : "Submit";
    els.options.innerHTML = q.options
      .map((opt, idx) => `
        <label class="quiz-option">
          <input type="radio" name="historyQuizChoice" value="${idx}">
          <span>${opt}</span>
        </label>
      `).join("");
    els.options.querySelectorAll('input[name="historyQuizChoice"]').forEach(input => {
      input.addEventListener("change", () => { els.submitBtn.disabled = false; });
    });
  }

  function startQuiz() {
    const gradeKey = els.select.value;
    if (!gradeKey) { alert("Please select a grade to start."); return; }
    state.gradeKey = gradeKey;
    state.questions = pickQuestions(gradeKey);
    state.current = 0;
    state.score = 0;
    state.answers = [];
    if (els.review) { els.review.style.display = "none"; els.review.innerHTML = ""; }
    setView({ setup: false, quiz: true, result: false });
    renderQuestion();
  }

  function submitAnswer() {
    const selected = els.options.querySelector('input[name="historyQuizChoice"]:checked');
    if (!selected) return;
    const answerIndex = Number(selected.value);
    const currentQ = state.questions[state.current];
    state.answers[state.current] = answerIndex;
    if (answerIndex === currentQ.correctIndex) state.score += 1;

    state.current += 1;
    if (state.current < state.questions.length) {
      renderQuestion();
    } else {
      showResult();
    }
  }

  function showResult() {
    const wrongs = [];
    state.questions.forEach((q, idx) => {
      const userIdx = state.answers[idx];
      if (userIdx !== q.correctIndex) {
        wrongs.push({
          q: q.q,
          correct: q.options[q.correctIndex],
          yours: userIdx != null ? q.options[userIdx] : "(no answer)"
        });
      }
    });

    setView({ setup: false, quiz: false, result: true });
    els.score.textContent = `You scored ${state.score} out of ${state.questions.length}.`;

    if (els.review) {
      els.review.innerHTML = "";
      els.review.style.display = "none";
      if (wrongs.length > 0) {
        els.review.innerHTML = `
          <h4>Review incorrect answers</h4>
          ${wrongs.map((w, i) => `
            <div class="wrong-item">
              <div class="q">${i + 1}. ${w.q}</div>
              <div class="a"><span class="label">Correct:</span> <span class="correct-answer">${w.correct}</span></div>
              <div class="a"><span class="label">Your answer:</span> <span class="your-answer">${w.yours}</span></div>
            </div>
          `).join("")}
        `;
        els.review.style.display = "block";
      }
    }
  }

  function playAgain() {
    if (!state.gradeKey) return toSetup();
    state.questions = pickQuestions(state.gradeKey);
    state.current = 0;
    state.score = 0;
    state.answers = [];
    if (els.review) { els.review.style.display = "none"; els.review.innerHTML = ""; }
    setView({ setup: false, quiz: true, result: false });
    renderQuestion();
  }

  function toSetup() {
    els.select.value = "";
    if (els.review) { els.review.style.display = "none"; els.review.innerHTML = ""; }
    setView({ setup: true, quiz: false, result: false });
  }

  // Events
  if (els.startBtn) els.startBtn.addEventListener("click", startQuiz);
  if (els.submitBtn) els.submitBtn.addEventListener("click", submitAnswer);
  if (els.playAgain) els.playAgain.addEventListener("click", playAgain);
  if (els.changeGrade) els.changeGrade.addEventListener("click", toSetup);

  // Default view
  setView({ setup: true, quiz: false, result: false });
})();
