'use strict';

let questionIndex = 0;
let score = 0;
let timerDuration = 30;
let timeLeft = timerDuration;
let timerInterval = null;
let streak = 0;
let answeredQuestions = new Set();

const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const shareBtn = document.getElementById('share-btn');
const timerSelect = document.getElementById('timer-select');

const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');

const questionText = document.getElementById('question-text');
const choicesList = document.getElementById('choices-list');
const feedbackEl = document.getElementById('feedback');
const questionNumberEl = document.getElementById('question-number');
const timeLeftEl = document.getElementById('time-left');
const scoreEl = document.getElementById('score');
const questionNavigator = document.getElementById('question-navigator');
const finalScoreEl = document.getElementById('final-score');
const bestScoreEl = document.getElementById('best-score');
const leaderboardEl = document.getElementById('leaderboard');

const correctSound = new Audio('https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg');
const wrongSound = new Audio('https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg');

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);
shareBtn.addEventListener('click', shareResult);
timerSelect.addEventListener('change', (e) => {
  timerDuration = parseInt(e.target.value, 10);
});

function startGame() {
  score = 0;
  streak = 0;
  answeredQuestions.clear();
  startScreen.classList.remove('active');
  startScreen.classList.add('hidden');

  quizScreen.classList.remove('hidden');
  quizScreen.classList.add('active');
  resultScreen.classList.remove('active');
  resultScreen.classList.add('hidden');

  questionIndex = 0;
  updateScore();
  loadNextQuestion();
}

function restartGame() {
  startGame();
}

function updateScore() {
  scoreEl.textContent = `? ${score}`;
}

function loadNextQuestion() {
  feedbackEl.textContent = '';
  clearInterval(timerInterval);

  if (answeredQuestions.size === questions.length) {
    // সব প্রশ্ন শেষ
    showResults();
    return;
  }

  // প্রশ্ন এলোমেলো চয়ন (যদি ইতিমধ্যে দেয়া থাকে, অন্য নাও)
  do {
    questionIndex = Math.floor(Math.random() * questions.length);
  } while (answeredQuestions.has(questionIndex));

  answeredQuestions.add(questionIndex);

  const questionData = questions[questionIndex];
  questionNumberEl.textContent = `প্রশ্ন <span class="math-inline" data-latex="%7BansweredQuestions.size%7D%20%2F">{answeredQuestions.size} /</span>{questions.length}`;
  questionText.textContent = questionData.question;

  choicesList.innerHTML = '';
  questionData.choices.forEach((choice, idx) => {
    const li = document.createElement('li');
    li.textContent = choice;
    li.dataset.index = idx;
    li.addEventListener('click', onSelectAnswer);
    choicesList.appendChild(li);
  });

  updateQuestionNavigator();
  startTimer();
}

function updateQuestionNavigator() {
  // নম্বর গুলি দেখাবে, সঠিক হলে green, ভুল হলে red কোন আইকন থাকবে না
  let html = '';
  for (let i = 1; i <= questions.length; i++) {
    if (i === answeredQuestions.size) {
      html += `<span style="color:#FFD700;font-weight:700">${i}</span> `;
    } else {
      html += `<span>${i}</span> `;
    }
  }
  questionNavigator.innerHTML = html.trim();
}

function startTimer() {
  timeLeft = timerDuration;
  timeLeftEl.textContent = timeLeft;

  timerInterval = setInterval(() => {
    timeLeft--;
    timeLeftEl.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      handleAnswer(null); // টাইম শেষ, উত্তর নেই ধরো ভুল
    }
  }, 1000);
}

function onSelectAnswer(e) {
  if (timerInterval === null) return; // যদি প্রশ্ন শেষ হয়ে যায়

  clearInterval(timerInterval);

  const selectedIndex = parseInt(e.currentTarget.dataset.index, 10);
  handleAnswer(selectedIndex);
}

function handleAnswer(selectedIndex) {
  timerInterval = null;
  const questionData = questions[questionIndex];
  const correctIndex = questionData.answer;

  // সব লাগানো ক্লাস মুছে ফেলা
  const lis = choicesList.querySelectorAll('li');
  lis.forEach(li => {
    li.classList.remove('correct', 'wrong');
    li.style.pointerEvents = 'none';
  });

  if (selectedIndex === correctIndex) {
    streak++;
    const basePoints = 10;
    const timeBonus = timeLeft;
    const streakBonus = Math.min(streak, 10); // streak max 10
    const totalPoints = basePoints + timeBonus + streakBonus;

    score += totalPoints;
    updateScore();

    // correct highlight + trophy icon
    const correctLi = lis[correctIndex];
    correctLi.classList.add('correct');
    correctLi.innerHTML += `<span class="trophy-icon">?</span>`;

    feedbackEl.style.color = '#28a745';
    feedbackEl.textContent = `সঠিক! +${totalPoints} পয়েন্ট`;

    correctSound.play();
  } else {
    streak = 0;

    feedbackEl.style.color = '#dc3545';
    feedbackEl.textContent = `ভুল উত্তর! সঠিক উত্তর: "${questionData.choices[correctIndex]}"`;

    wrongSound.play();

    // সঠিক উত্তর হাইলাইট
    lis[correctIndex].classList.add('correct');

    if (selectedIndex !== null && lis[selectedIndex]) {
      lis[selectedIndex].classList.add('wrong');
    }
  }

  // ১.৫ সেকেন্ড পরে পরবর্তী প্রশ্ন
  setTimeout(() => {
    loadNextQuestion();
  }, 1500);
}

function showResults() {
  startScreen.classList.add('hidden');
  quizScreen.classList.add('hidden');
  quizScreen.classList.remove('active');

  resultScreen.classList.remove('hidden');
  resultScreen.classList.add('active');

  finalScoreEl.textContent = `তোমার মোট স্কোর: ${score}`;

  // localStorage থেকে best score নিয়ে আসা
  const bestScore = parseInt(localStorage.getItem('bf007_best_score')) || 0;
  if (score > bestScore) {
    localStorage.setItem('bf007_best_score', score);
    bestScoreEl.textContent = `নতুন কেন্ডার স্কোর! পূর্বের সেরা: ${bestScore}`;
  } else {
    bestScoreEl.textContent = `সেরা স্কোর: ${bestScore}`;
  }

  updateLeaderboard();
}

function updateLeaderboard() {
  // লিডারবোর্ড মানে সেরা ৫ রেকর্ড। এখানে কেবল best score বলে নিব একরকম
  leaderboardEl.innerHTML = '';

  const savedScores = JSON.parse(localStorage.getItem('bf007_leaderboard') || '[]');

  // প্রয়োজনে স্কোর যুক্ত করো
  // প্রত্যেকবার গেম শেষে লিখতে হবে না, এখানে demo হিসেবে keep only best score
  let leaderboard = savedScores;

  // যদি স্কোর বেশি হয় এবং leaderboard-এ না থাকে যোগ করো
  // শুধুমাত্র বর্তমান স্কোর সেট
  if (!leaderboard.includes(score) && score > 0) {
    leaderboard.push(score);
    leaderboard.sort((a,b) => b-a);
    if (leaderboard.length > 5) leaderboard = leaderboard.slice(0,5);
    localStorage.setItem('bf007_leaderboard', JSON.stringify(leaderboard));
  }

  if (leaderboard.length === 0) {
    leaderboardEl.innerHTML = '<li>কোনো লিডারবোর্ড নেই</li>';
  } else {
    leaderboard.forEach((val, i) => {
      leaderboardEl.innerHTML += `<li>? <span class="math-inline" data-latex="%7Bi%2B1%7D.%20%E0%A6%B8%E0%A7%8D%E0%A6%95%E0%A7%8B%E0%A6%B0%3A">{i+1}. স্কোর:</span>{val}</li>`;
    });
  }
}

function shareResult() {
  const shareText = `আমার Black Force 007 Quiz Game স্কোর হলো ${score}। তোমার কী স্কোর? \nhttps://yourgameurl.example.com/`;
  if (navigator.share) {
    navigator.share({
      title: 'Black Force 007 — Quiz Game',
      text: shareText
    }).catch(err => console.log('Share failed:', err));
  } else {
    alert('আপনার ব্রাউজার শেয়ার API সমর্থন করে না। স্কোর কপি করুন:\n'+shareText);
  }
}
