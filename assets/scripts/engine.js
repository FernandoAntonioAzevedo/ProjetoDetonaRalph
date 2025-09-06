const state = {
  view: {
    squares: document.querySelectorAll(".square"),
    enemy: document.querySelector(".enemy"),
    timeLeft: document.querySelector("#time-left"),
    score: document.querySelector("#score"),
    lives: document.querySelector(".menu-lives h2"),
    rankingList: document.querySelector("#ranking-list"), // Essencial  p/ renderizar o ranking
  },
  values: {
    gameVelocity: 1000,
    hitPosition: null,
    result: 0,
    currentTime: 30,
    lives: 5,
    ranking: JSON.parse(localStorage.getItem("ranking")) || [], //  carrega ranking
  },
  actions: {
    timerId: null,            //  intervalo do inimigo
    countDownTimerId: null,   // aqui guardamos o intervalo do cronômetro
    roundRunning: false,
  },
};

/* Utilidades de UI  */
function updateLives() {
  state.view.lives.textContent = `x${state.values.lives}`;
}

function updateTime() {
  state.view.timeLeft.textContent = state.values.currentTime;
}

function updateScore() {
  state.view.score.textContent = state.values.result;
}

/*  Audios  */
function playSound(audioName) {
  try {
    const audio = new Audio(`./assets/audios/${audioName}.m4a`);
    audio.volume = 0.2;
    audio.play();
  } catch (_) {}
}

/*  Ranking  */
function updateRanking() {
  // Ordena do maior para o menor
  state.values.ranking.sort((a, b) => b - a);
  const top5 = state.values.ranking.slice(0, 5);

  // Atualiza HTML
  if (state.view.rankingList) {
    state.view.rankingList.innerHTML = "";
    top5.forEach((score, index) => {
      const li = document.createElement("li");
      li.textContent = `${index + 1}º - ${score} pontos`;
      state.view.rankingList.appendChild(li);
    });
  }

  // Salvamos no localStorage
  localStorage.setItem("ranking", JSON.stringify(state.values.ranking));
}

/*  Lógica do Detona Ralph  */
function clearAllIntervals() {
  if (state.actions.countDownTimerId) {
    clearInterval(state.actions.countDownTimerId);
    state.actions.countDownTimerId = null;
  }
  if (state.actions.timerId) {
    clearInterval(state.actions.timerId);
    state.actions.timerId = null;
  }
  state.actions.roundRunning = false;
}

function randomSquare() {
  state.view.squares.forEach((square) => square.classList.remove("enemy"));

  const randomNumber = Math.floor(Math.random() * 9);
  const randomSquareEl = state.view.squares[randomNumber];
  randomSquareEl.classList.add("enemy");
  state.values.hitPosition = randomSquareEl.id;
}

function moveEnemy() {
  // aqui garante que não existam intervalos antigos
  if (state.actions.timerId) clearInterval(state.actions.timerId);
  state.actions.timerId = setInterval(randomSquare, state.values.gameVelocity);
}

function startCountdown() {
  if (state.actions.countDownTimerId) clearInterval(state.actions.countDownTimerId);
  state.actions.countDownTimerId = setInterval(countDown, 1000);
}

function countDown() {
  state.values.currentTime--;
  updateTime();

  if (state.values.currentTime <= 0) {
    // fim da rodada
    endRound();
  }
}

function endRound() {
  // pausa tudo
  clearAllIntervals();

  // perde 1 vida
  state.values.lives--;
  updateLives();
  playSound("fail"); 

  if (state.values.lives > 0) {
    // pequena pausa para "respirar" e reiniciar
    setTimeout(startNextRound, 1500);
  } else {
    // fim de jogo: salva score no ranking e mostra alerta
    state.values.ranking.push(state.values.result);
    updateRanking();
    alert("Game Over! Sua pontuação final foi: " + state.values.result);    
    resetGame();
  }
}

function startNextRound() {
  state.values.currentTime = 30;
  updateTime();
  moveEnemy();
  startCountdown();
  state.actions.roundRunning = true;
}

/*  Acertos no Ralph  */
function addEventListenerHitBox() {
  state.view.squares.forEach((square) => {
    square.addEventListener("mousedown", () => {
      if (square.id === state.values.hitPosition) {
        state.values.result++;
        updateScore();
        state.values.hitPosition = null;
        playSound("hit");
        
      }
    });
  });
}

/* ---------- Ciclo de vida ---------- */
function resetGame() {
  clearAllIntervals();
  // (opcional) reiniciar valores
  state.values.result = 0;
  state.values.currentTime = 30;
  state.values.lives = 5;
  updateScore();
  updateLives();
  updateTime();
  // recomeça uma nova rodada automaticamente
  startNextRound();
}

function initialize() {
  updateLives();
  updateTime();
  updateScore();
  updateRanking(); // mostra ranking salvo
  addEventListenerHitBox();
  startNextRound(); // inicia a primeira rodada
}

initialize();
