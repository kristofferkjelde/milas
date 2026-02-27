(() => {
  const STORAGE_KEY = "potatoQuizAnswers";

  const QUESTION_KEYS = ["q1", "q2", "q3", "q4", "q5", "q6"];

  const PAGE_TO_QUESTION = {
    "spg_1.html": "q1",
    "spg_2.html": "q2",
    "spg_3.html": "q3",
    "spg_4.html": "q4",
    "spg_5.html": "q5",
    "spg_6.html": "q6"
  };

  const QUESTION_TO_PAGE = {
    q1: "spg_1.html",
    q2: "spg_2.html",
    q3: "spg_3.html",
    q4: "spg_4.html",
    q5: "spg_5.html",
    q6: "spg_6.html"
  };

  const pointsMap = {
    q1: { A: "bagt", B: "pomfrit", C: "mos", D: "rosti", E: "chips", F: "ra" },
    q2: { A: "bagt", B: "chips", C: "mos", D: "rosti", E: "pomfrit", F: "ra" },
    q3: { A: "bagt", B: "pomfrit", C: "mos", D: "rosti", E: "chips", F: "ra" },
    q4: { A: "bagt", B: "pomfrit", C: "mos", D: "rosti", E: "chips", F: "ra" },
    q5: { A: "bagt", B: "pomfrit", C: "mos", D: "rosti", E: "chips", F: "ra" },
    q6: { A: "bagt", B: "pomfrit", C: "mos", D: "rosti", E: "chips", F: "ra" }
  };

  const TIE_PRIORITY = ["bagt", "pomfrit", "mos", "rosti", "chips", "ra"];

  const RESULT_PAGE_MAP = {
    bagt: "resultat_bag.html",
    pomfrit: "resultat_pomfrit.html",
    mos: "resultat_mos.html",
    rosti: "resultat_rosti.html",
    chips: "resultat_chips.html",
    ra: "resultat_r\u00e5 kartoffel.html"
  };

  const pageName = window.location.pathname.split("/").pop();

  function loadAnswers() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return {};
      return parsed;
    } catch (_error) {
      return {};
    }
  }

  function saveAnswers(answers) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  }

  function getSelectedAnswer() {
    const selected = document.querySelector('input[name="fav_language"]:checked');
    return selected ? selected.value : null;
  }

  function preselectAnswer(answerValue) {
    if (!answerValue) return;
    const radio = document.querySelector(
      `input[name="fav_language"][value="${answerValue}"]`
    );
    if (radio) {
      radio.checked = true;
    }
  }

  function getWinnerType(answers) {
    const scores = {
      bagt: 0,
      pomfrit: 0,
      mos: 0,
      rosti: 0,
      chips: 0,
      ra: 0
    };

    QUESTION_KEYS.forEach((questionKey) => {
      const answerValue = answers[questionKey];
      const type = pointsMap[questionKey] && pointsMap[questionKey][answerValue];
      if (type) {
        scores[type] += 1;
      }
    });

    const maxScore = Math.max(...TIE_PRIORITY.map((type) => scores[type]));
    return TIE_PRIORITY.find((type) => scores[type] === maxScore) || "bagt";
  }

  function handleStartPage() {
    const startLink = document.querySelector('[data-action="start"]');
    if (!startLink) return;

    startLink.addEventListener("click", () => {
      sessionStorage.removeItem(STORAGE_KEY);
    });
  }

  function handleQuestionPage(currentQuestionKey) {
    const answers = loadAnswers();
    preselectAnswer(answers[currentQuestionKey]);

    const backLinks = document.querySelectorAll('[data-action="back"]');
    backLinks.forEach((backLink) => {
      backLink.addEventListener("click", () => {
        const selected = getSelectedAnswer();
        if (selected) {
          answers[currentQuestionKey] = selected;
          saveAnswers(answers);
        }
      });
    });

    const nextLink = document.querySelector('[data-action="next"]');
    if (nextLink) {
      nextLink.addEventListener("click", (event) => {
        event.preventDefault();
        const selected = getSelectedAnswer();
        if (!selected) {
          alert("V\u00e6lg et svar f\u00f8r du g\u00e5r videre.");
          return;
        }

        answers[currentQuestionKey] = selected;
        saveAnswers(answers);
        const target = nextLink.getAttribute("href");
        if (target) {
          window.location.href = target;
        }
      });
    }

    const resultLink = document.querySelector('[data-action="result"]');
    if (resultLink) {
      resultLink.addEventListener("click", (event) => {
        event.preventDefault();
        const selected = getSelectedAnswer();
        if (!selected) {
          alert("V\u00e6lg et svar f\u00f8r du ser dit resultat.");
          return;
        }

        answers[currentQuestionKey] = selected;
        saveAnswers(answers);

        const missingQuestion = QUESTION_KEYS.find((questionKey) => {
          return !["A", "B", "C", "D", "E", "F"].includes(answers[questionKey]);
        });

        if (missingQuestion) {
          window.location.href = QUESTION_TO_PAGE[missingQuestion];
          return;
        }

        const winnerType = getWinnerType(answers);
        const resultPage = RESULT_PAGE_MAP[winnerType] || RESULT_PAGE_MAP.bagt;
        window.location.href = resultPage;
      });
    }
  }

  if (pageName === "quiz.html") {
    handleStartPage();
    return;
  }

  const currentQuestionKey = PAGE_TO_QUESTION[pageName];
  if (currentQuestionKey) {
    handleQuestionPage(currentQuestionKey);
  }
})();
