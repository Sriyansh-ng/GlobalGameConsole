// Science Quiz: grade selection -> 5-question round -> score + review (science-only topics)

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
  function choice(arr) { return arr[randInt(0, arr.length - 1)]; }

  // Topic pools per grade: Basic, Earth, Space, Physics, Chemistry, Biology
  const pools = {
    g1: {
      basic: [
        { q: "Which animal says 'Moo'?", correct: "Cow", d: ["Dog", "Cat", "Sheep", "Goat", "Horse"] },
        { q: "What do plants need to grow?", correct: "Water", d: ["Sand", "Plastic", "Metal", "Glass"] },
        { q: "Which is a source of light?", correct: "Sun", d: ["Stone", "Leaf", "Book", "Spoon"] },
        { q: "Which sense uses the eyes?", correct: "Seeing", d: ["Hearing", "Smelling", "Tasting", "Touching"] },
        { q: "Which body part helps you hear?", correct: "Ears", d: ["Eyes", "Nose", "Tongue", "Skin"] }
      ],
      earth: [
        { q: "Which season is the coldest?", correct: "Winter", d: ["Spring", "Summer", "Autumn", "Monsoon"] },
        { q: "Which of these is a landform?", correct: "Mountain", d: ["Table", "Car", "Pencil", "Plate"] },
        { q: "What do we call moving air?", correct: "Wind", d: ["Rain", "Fog", "Sunlight", "Snow"] }
      ],
      space: [
        { q: "What lights up the day?", correct: "Sun", d: ["Moon", "Stars", "Clouds", "Lamp"] },
        { q: "What do we see at night in the sky?", correct: "Stars", d: ["Cars", "Fish", "Trees", "Houses"] },
        { q: "Earth is a", correct: "Planet", d: ["Star", "Comet", "Rock", "Leaf"] }
      ],
      physics: [
        { q: "A door opens when you", correct: "Push or pull it", d: ["Look at it", "Sing", "Sleep", "Blink"] },
        { q: "Which one is a solid?", correct: "Ice", d: ["Water", "Steam", "Cloud", "Rain"] }
      ],
      chemistry: [
        { q: "Water can be a solid, liquid, or", correct: "Gas", d: ["Wood", "Metal", "Sand", "Soil"] },
        { q: "Which one melts in the sun?", correct: "Ice cream", d: ["Stone", "Wood", "Glass", "Brick"] }
      ],
      biology: [
        { q: "Plants make food in their", correct: "Leaves", d: ["Roots", "Stem", "Flower", "Seeds"] },
        { q: "Fish live in", correct: "Water", d: ["Sky", "Desert", "Forest", "House"] },
        { q: "Birds have", correct: "Wings", d: ["Fins", "Hooves", "Scales", "Gills"] }
      ]
    },
    g2: {
      basic: [
        { q: "We breathe in", correct: "Oxygen", d: ["Carbon dioxide", "Nitrogen", "Hydrogen", "Helium"] },
        { q: "Humans are", correct: "Mammals", d: ["Birds", "Reptiles", "Amphibians", "Fish"] },
        { q: "Which is a mammal?", correct: "Whale", d: ["Shark", "Frog", "Eagle", "Lizard"] }
      ],
      earth: [
        { q: "Water turns to ice at ___ °C", correct: "0", d: ["10", "50", "100", "-10"] },
        { q: "Which rock is often used in pencils?", correct: "Graphite", d: ["Quartz", "Gold", "Sandstone", "Marble"] },
        { q: "Soil is made from tiny pieces of", correct: "Rocks", d: ["Plastic", "Glass", "Metal", "Paper"] }
      ],
      space: [
        { q: "What force keeps us on Earth?", correct: "Gravity", d: ["Friction", "Magnetism", "Electricity", "Light"] },
        { q: "The Moon goes around the", correct: "Earth", d: ["Sun", "Mars", "Jupiter", "Venus"] },
        { q: "The Sun is a", correct: "Star", d: ["Planet", "Comet", "Asteroid", "Satellite"] }
      ],
      physics: [
        { q: "A magnet attracts", correct: "Iron", d: ["Plastic", "Wood", "Rubber", "Paper"] },
        { q: "Friction happens when objects", correct: "Rub against each other", d: ["Glow", "Disappear", "Freeze", "Float"] },
        { q: "Which state of matter flows easily?", correct: "Liquid", d: ["Solid", "Gas (in container)", "Rock", "Ice"] }
      ],
      chemistry: [
        { q: "Water changing to gas is called", correct: "Evaporation", d: ["Condensation", "Freezing", "Melting", "Sublimation"] },
        { q: "Mixture of salt and water is a", correct: "Solution", d: ["Solid", "Gas", "Powder", "Rock"] },
        { q: "Which is an acid?", correct: "Lemon juice", d: ["Baking soda", "Sugar", "Salt", "Water"] }
      ],
      biology: [
        { q: "Plants make food by", correct: "Photosynthesis", d: ["Digestion", "Respiration", "Fermentation", "Evaporation"] },
        { q: "Insects have how many legs?", correct: "6", d: ["4", "8", "10", "12"] },
        { q: "Animals that eat only plants are", correct: "Herbivores", d: ["Carnivores", "Omnivores", "Detritivores", "Parasites"] }
      ]
    },
    g3: {
      basic: [
        { q: "Which organ pumps blood?", correct: "Heart", d: ["Lungs", "Liver", "Stomach", "Brain"] },
        { q: "Which organ helps you think?", correct: "Brain", d: ["Heart", "Lungs", "Stomach", "Liver"] },
        { q: "Bones together form the", correct: "Skeleton", d: ["Muscle", "Skin", "Blood", "Lungs"] }
      ],
      earth: [
        { q: "Which is a sedimentary rock?", correct: "Sandstone", d: ["Granite", "Basalt", "Marble", "Obsidian"] },
        { q: "The process of soil washing away is", correct: "Erosion", d: ["Deposition", "Condensation", "Evaporation", "Melting"] },
        { q: "Weather measured over many years is", correct: "Climate", d: ["Storm", "Season", "Rain", "Forecast"] }
      ],
      space: [
        { q: "Which is the largest planet?", correct: "Jupiter", d: ["Earth", "Mars", "Venus", "Mercury"] },
        { q: "The path a planet takes around the Sun is its", correct: "Orbit", d: ["Axis", "Equator", "Diameter", "Shadow"] },
        { q: "Distant groups of stars forming patterns are", correct: "Constellations", d: ["Galaxies", "Asteroids", "Comets", "Planets"] }
      ],
      physics: [
        { q: "Energy of motion is called", correct: "Kinetic energy", d: ["Potential energy", "Thermal energy", "Light energy", "Sound energy"] },
        { q: "Heat moves from", correct: "Hot to cold", d: ["Cold to hot", "Dark to light", "Left to right", "Up to down"] },
        { q: "A complete path for electricity is a", correct: "Circuit", d: ["Battery", "Wire", "Switch", "Magnet"] }
      ],
      chemistry: [
        { q: "Table salt is made of", correct: "Sodium and chlorine", d: ["Carbon and oxygen", "Hydrogen and helium", "Iron and gold", "Nitrogen and neon"] },
        { q: "Matter is anything that has", correct: "Mass and takes up space", d: ["Color", "Taste", "Smell", "Temperature"] },
        { q: "A change that forms a new substance is", correct: "Chemical change", d: ["Physical change", "Melting", "Freezing", "Evaporation"] }
      ],
      biology: [
        { q: "Animals that eat both plants and animals are", correct: "Omnivores", d: ["Herbivores", "Carnivores", "Detritivores", "Insectivores"] },
        { q: "The green pigment in leaves is", correct: "Chlorophyll", d: ["Hemoglobin", "Keratin", "Melanin", "Glucose"] },
        { q: "The smallest unit of life is the", correct: "Cell", d: ["Tissue", "Organ", "Organ system", "Atom"] }
      ]
    }
  };

  // Generators to augment each topic pool (adds variety)
  function extendPool(arr, gen, count) { for (let i = 0; i < count; i++) arr.push(gen()); }
  function genBasicG1() {
    const senses = [
      { q: "Which sense uses the nose?", correct: "Smelling", d: ["Seeing", "Hearing", "Tasting", "Touching"] },
      { q: "Which body part helps you taste?", correct: "Tongue", d: ["Ear", "Eye", "Nose", "Skin"] }
    ];
    return choice(senses);
  }
  function genEarthG1() {
    const weathers = ["Sunny", "Rainy", "Windy", "Snowy", "Cloudy"];
    const correct = choice(weathers);
    return { q: "Which is a type of weather?", correct, d: weathers.concat(["Table", "Chair", "Pencil"]) };
  }
  function genSpaceG1() {
    const items = ["Sun", "Moon", "Star"];
    const correct = choice(items);
    return { q: "Which do we see in the sky?", correct, d: items.concat(["Car", "Tree", "House"]) };
  }
  function genPhysicsG1() {
    const q = "What makes a swing move higher?";
    return { q, correct: "Pushing harder", d: ["Sitting still", "Closing eyes", "Whispering", "Counting"] };
  }
  function genChemG1() {
    const q = "Ice turns into water when it";
    return { q, correct: "Melts", d: ["Freezes", "Evaporates", "Condenses", "Rusts"] };
  }
  function genBioG1() {
    const q = "Which needs water to live?";
    return { q, correct: "Plant", d: ["Rock", "Plastic toy", "Glass", "Metal spoon"] };
  }

  function genBasicG2() {
    const q = "Which of these is a simple machine?";
    return { q, correct: "Inclined plane", d: ["Engine", "Computer", "Cloud", "Rainbow"] };
  }
  function genEarthG2() {
    const q = "Rocks break into soil mainly by";
    return { q, correct: "Weathering", d: ["Boiling", "Freezing water", "Painting", "Polishing"] };
  }
  function genSpaceG2() {
    const q = "One complete spin of Earth is called a";
    return { q, correct: "Rotation", d: ["Revolution", "Reflection", "Refraction", "Erosion"] };
  }
  function genPhysicsG2() {
    const q = "Friction can be reduced by";
    return { q, correct: "Using oil (lubrication)", d: ["Pressing harder", "Adding sand", "Heating", "Shaking"] };
  }
  function genChemG2() {
    const q = "Salt disappears in water because it";
    return { q, correct: "Dissolves", d: ["Freezes", "Burns", "Evaporates", "Rusts"] };
  }
  function genBioG2() {
    const q = "Animals in cold regions often have";
    return { q, correct: "Thick fur", d: ["Thin fur", "Feathers only", "Scales only", "No cover"] };
  }

  function genBasicG3() {
    const q = "Tools help us do work by changing";
    return { q, correct: "Force or direction", d: ["Color of objects", "Taste of food", "Sound level", "Smell of air"] };
  }
  function genEarthG3() {
    const q = "Earthquakes are caused by movement of";
    return { q, correct: "Tectonic plates", d: ["Ocean waves", "Wind", "Clouds", "Volcano smoke"] };
  }
  function genSpaceG3() {
    const q = "The Sun is at the center of our";
    return { q, correct: "Solar system", d: ["Galaxy", "Universe", "Continent", "Country"] };
  }
  function genPhysicsG3() {
    const q = "A magnet has two poles called";
    return { q, correct: "North and South", d: ["East and West", "Up and Down", "Hot and Cold", "Left and Right"] };
  }
  function genChemG3() {
    const q = "Water vapor turning to water droplets is";
    return { q, correct: "Condensation", d: ["Evaporation", "Freezing", "Melting", "Sublimation"] };
  }
  function genBioG3() {
    const q = "Living things pass traits to offspring through";
    return { q, correct: "Heredity", d: ["Gravity", "Friction", "Weather", "Seasons"] };
  }

  // Extend each topic pool a bit for variety
  function extendTopics() {
    // Add ~10 per topic per grade to ensure rich banks
    const count = 10;
    const map = [
      [pools.g1.basic, genBasicG1], [pools.g1.earth, genEarthG1], [pools.g1.space, genSpaceG1], [pools.g1.physics, genPhysicsG1], [pools.g1.chemistry, genChemG1], [pools.g1.biology, genBioG1],
      [pools.g2.basic, genBasicG2], [pools.g2.earth, genEarthG2], [pools.g2.space, genSpaceG2], [pools.g2.physics, genPhysicsG2], [pools.g2.chemistry, genChemG2], [pools.g2.biology, genBioG2],
      [pools.g3.basic, genBasicG3], [pools.g3.earth, genEarthG3], [pools.g3.space, genSpaceG3], [pools.g3.physics, genPhysicsG3], [pools.g3.chemistry, genChemG3], [pools.g3.biology, genBioG3]
    ];
    map.forEach(([arr, gen]) => extendPool(arr, gen, count));
  }
  extendTopics();

  // Build balanced question banks per grade (50 each)
  function buildBalanced(target, topicArrays) {
    const out = [];
    const all = topicArrays.map(a => shuffle([...a])); // copy and shuffle each topic
    let i = 0;
    while (out.length < target) {
      const topicIdx = i % all.length;
      const topic = all[topicIdx];
      if (topic.length === 0) {
        i++;
        continue;
      }
      const item = topic.pop();
      out.push(pickFromPool(item));
      i++;
    }
    return out.slice(0, target);
  }

  const questionBank = {
    grade1: buildBalanced(50, [pools.g1.basic, pools.g1.earth, pools.g1.space, pools.g1.physics, pools.g1.chemistry, pools.g1.biology]),
    grade2: buildBalanced(50, [pools.g2.basic, pools.g2.earth, pools.g2.space, pools.g2.physics, pools.g2.chemistry, pools.g2.biology]),
    grade3: buildBalanced(50, [pools.g3.basic, pools.g3.earth, pools.g3.space, pools.g3.physics, pools.g3.chemistry, pools.g3.biology])
  };

  // Element refs
  const els = {
    setup: document.getElementById("scienceQuizSetup"),
    select: document.getElementById("scienceGradeSelect"),
    startBtn: document.getElementById("scienceStartQuizBtn"),
    container: document.getElementById("scienceQuizContainer"),
    question: document.getElementById("scienceQuizQuestion"),
    options: document.getElementById("scienceQuizOptions"),
    progress: document.getElementById("scienceQuizProgress"),
    submitBtn: document.getElementById("scienceQuizSubmitBtn"),
    result: document.getElementById("scienceQuizResult"),
    score: document.getElementById("scienceQuizScore"),
    review: document.getElementById("scienceQuizReview"),
    playAgain: document.getElementById("scienceQuizPlayAgain"),
    changeGrade: document.getElementById("scienceQuizChangeGrade")
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
          <input type="radio" name="scienceQuizChoice" value="${idx}">
          <span>${opt}</span>
        </label>
      `).join("");
    els.options.querySelectorAll('input[name="scienceQuizChoice"]').forEach(input => {
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
    const selected = els.options.querySelector('input[name="scienceQuizChoice"]:checked');
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
    // Build wrong answers
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
