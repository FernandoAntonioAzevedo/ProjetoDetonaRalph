const state = {
    view:{
        squares: document.querySelectorAll(".square"),
        enemy: document.querySelector(".enemy"),
        timeLeft: document.querySelector("#time-left"),
        score: document.querySelector("#score"),
        lives: document.querySelector(".menu-lives h2"),
    },
    values:{        
        gameVelocity: 1000,
        hitPosition: 0,
        result: 0,
        currentTime: 60,
        lives: 5, // valor inicial de vidas do player
    },
    actions: {
        timerId: null,
        countDownTimerId: setInterval(countDown, 1000),
    }
};

function updateLives() {
    state.view.lives.textContent = `x${state.values.lives}`;
}

function countDown() {
    state.values.currentTime--;
    state.view.timeLeft.textContent = state.values.currentTime;

    if(state.values.currentTime <= 0) {
        clearInterval(state.actions.countDownTimerId);
        clearInterval(state.actions.timerId);
        state.values.lives--; // o player perde 1 vida
        updateLives();

        if(state.values.lives > 0) {
            // reinicia tempo e inimigo
            state.values.currentTime = 60;
            state.actions.countDownTimerId = setInterval(countDown, 1000);
            moveEnemy();
        } else {
            alert("Game Over! Sua pontuação final foi: " + state.values.result);
        }
    }
}

function playSound(audioName) {
    let audio = new Audio(`./assets/audios/${audioName}.m4a`);
    audio.volume = 0.2;
    audio.play();
}

function randomSquare() {
    state.view.squares.forEach((square) => {
        square.classList.remove("enemy");
    });

    let randomNumber = Math.floor(Math.random() * 9);
    let randomSquare = state.view.squares[randomNumber];
    randomSquare.classList.add("enemy");
    state.values.hitPosition = randomSquare.id;
}

function moveEnemy() {
    state.values.timerId = setInterval(randomSquare, state.values.gameVelocity);
}

function addEventListenerHitBox() {
    state.view.squares.forEach((square) => {
        square.addEventListener("mousedown", () => {
            if(square.id === state.values.hitPosition) {
                state.values.result++;
                state.view.score.textContent = state.values.result;
                state.values.hitPosition = null;
                playSound("hit");
            }
        });
    });
}


function initialize() {
    updateLives();    
    moveEnemy();
    addEventListenerHitBox();
}

initialize();

// Ranking

function updateRanking() {
    // Ordena do maior para o menor
    state.values.ranking.sort((a, b) => b - a);

    // os 5 melhores
    let top5 = state.values.ranking.slice(0, 5);

    // Atualiza HTML
    state.view.rankingList.innerHTML = "";
    top5.forEach((score, index) => {
        let li = document.createElement("li");
        li.textContent = `${index + 1}º - ${score} pontos`;
        state.view.rankingList.appendChild(li);
    });

    // Salva no localStorage
    localStorage.setItem("ranking", JSON.stringify(state.values.ranking));
}
