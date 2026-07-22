let currentSlideIndex = 0;

let userScores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

let userAnswers = {};

function resetQuizState() {
  currentSlideIndex = 0;
  userScores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  userAnswers = {};
}

function recordAnswer(questionId, type) {
  if (userAnswers[questionId] !== undefined) {
    const prev = userAnswers[questionId];
    userScores[prev] = Math.max(0, userScores[prev] - 1);
  }
  userAnswers[questionId] = type;
  userScores[type]++;
}

function calculateQuizResult() {
  const E_or_I = userScores.E >= userScores.I ? 'E' : 'I';
  const S_or_N = userScores.S >= userScores.N ? 'S' : 'N';
  const T_or_F = userScores.T >= userScores.F ? 'T' : 'F';
  const J_or_P = userScores.J >= userScores.P ? 'J' : 'P';

  const mbtiType = E_or_I + S_or_N + T_or_F + J_or_P;
  return {
    type:      mbtiType,
    result:    quizData.results[mbtiType],
    scores:    { ...userScores },
    breakdown: { E_or_I, S_or_N, T_or_F, J_or_P }
  };
}
