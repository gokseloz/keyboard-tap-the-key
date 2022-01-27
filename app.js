const KEY_CODES = [
  81, 87, 69, 82, 84, 90, 85, 73, 79, 80, 186, 65, 83, 68, 70, 71, 72, 74, 75,
  76, 192, 222, 89, 88, 67, 86, 66, 78, 77, 188, 190,
];

let pressedKey, demandedButton, demandedKey;
let isPressed = false;
let currentScore = 0;
let gainedScore = 0;
let bestScore = 0;
let seconds = 0;
let isResetting = false;
let isPaused = true;
let isGameStarted = false;
let timeInterval;
let numberOfTaps = 0;

const currentScoreEl = document.getElementById("current-score");
const bestScoreEl = document.getElementById("best-score");
const secondsEl = document.getElementById("seconds");
const tappedEl = document.getElementById("numberOfTaps");

const startBtn = document.querySelector(".start");
const stopBtn = document.querySelector(".stop");
const resumeBtn = document.querySelector(".resume");
const actionBtns = document.querySelectorAll(".actionBtn");

const modal = document.querySelector(".modal");

const startTheGame = () => {
  isPaused = false;
  isGameStarted = true;
  localStorage.removeItem("seconds");
  getNewKey();
  resetTime();
  startTime();
  resetCurrentScore();
  resetNumberOfTaps();
};

const resetTime = () => {
  clearInterval(timeInterval);
  seconds = 0;
  secondsEl.textContent = seconds;
};

const resetNumberOfTaps = () => {
  numberOfTaps = 0;
  tappedEl.textContent = numberOfTaps;
};

const timeBtnsStyle = (methodType) => {
  actionBtns.forEach((e) => {
    if (methodType === "add") {
      e.disabled = true;
      e.classList.add("actionBtnIsResetting");
    } else {
      e.disabled = false;
      e.classList.remove("actionBtnIsResetting");
      e.classList.remove("btnActive");
    }
  });
};

const startTime = () => {
  seconds += 1;
  secondsEl.textContent = seconds;

  if (isPaused) {
    clearInterval(timeInterval);
    seconds = 0;
    secondsEl.textContent = seconds;
  }

  isPaused = false;
  clearInterval(timeInterval);
  timeInterval = setInterval(() => {
    seconds += 1;
    secondsEl.textContent = seconds;
  }, 1000);
};

const stopTime = () => {
  isPaused = true;
  clearInterval(timeInterval);
};

const resumeTime = () => {
  isPaused = false;
  if (isGameStarted) {
    timeInterval = setInterval(() => {
      seconds += 1;
      secondsEl.textContent = seconds;
    }, 1000);
  }
};

const showBestScore = () => {
  const data = JSON.parse(localStorage.getItem("bestScore"));
  if (data) {
    bestScore = data;
    bestScoreEl.textContent = String(bestScore);
  }
};

const calculateGainedScore = () => {
  const baseDivider = 10;
  const secondFromPreviousClick = JSON.parse(localStorage.getItem("seconds"));
  const secondFromCurrentClick = Number(secondsEl.textContent);
  JSON.stringify(localStorage.setItem("seconds", secondFromCurrentClick));

  if (secondFromPreviousClick) {
    gainedScore =
      baseDivider / (secondFromCurrentClick - secondFromPreviousClick);
    gainedScore === Infinity ? (gainedScore = 10) : gainedScore;
  } else {
    gainedScore = baseDivider / secondFromCurrentClick;
    gainedScore === Infinity && (gainedScore = 0);
  }
  return gainedScore;
};

const resetCurrentScore = () => {
  currentScore = 0;
  currentScoreEl.textContent = currentScore;
};

const updateCurrentScore = () => {
  if (isResetting) {
    currentScore = 0;
  } else {
    calculateGainedScore();
    currentScore = parseInt(currentScore + gainedScore);
  }
  currentScoreEl.textContent = currentScore;
};

const updateBestScore = () => {
  if (currentScore >= bestScore) {
    JSON.stringify(localStorage.setItem("bestScore", currentScore));
    bestScoreEl.textContent = currentScore;
  }
};

const getCorrespondingBtn = (value) => {
  return document.querySelector(`button[value="${value}"]`);
};

const getNewCharacter = () => {
  const randomNumber = Math.floor(Math.random() * KEY_CODES.length);
  return KEY_CODES[randomNumber];
};

const getNewKey = () => {
  if (document.querySelector(".demanded")) return;
  demandedKey = getNewCharacter();
  demandedButton = getCorrespondingBtn(demandedKey);
  demandedButton.classList.add("demanded");
};

const deleteOldCharacter = () => {
  demandedButton.classList.remove("demanded");
};

const checkpressedKey = (demandedKey, pressedKey) => {
  return demandedKey === pressedKey;
};

const actionAllButtonStyle = (actionType) => {
  KEY_CODES.forEach((key) => {
    const eachButton = getCorrespondingBtn(key);
    if (actionType === "add") eachButton.classList.add("demanded");
    else eachButton.classList.remove("demanded");
  });
};

const showModal = () => {
  modal.classList.add("open");
};
const closeModal = () => {
  modal.classList.remove("open");
};

const resetGame = () => {
  isResetting = true;
  isPaused = true;
  updateBestScore();
  updateCurrentScore();
  actionAllButtonStyle("add");
  showModal();
  resetTime();
  timeBtnsStyle("add");
  resetNumberOfTaps();

  setTimeout(() => {
    actionAllButtonStyle("remove");
    timeBtnsStyle("remove");
    closeModal();
    isResetting = false;
    isPaused = false;
    isGameStarted = false;
    focusOnStart();
  }, 2000);
};

function addSound() {
  new Audio("./assets/keyType.mp3").play();
}

const keyActive = (e) => {
  if (
    !isPaused &&
    !isPressed &&
    KEY_CODES.includes(e.keyCode) &&
    !isResetting
  ) {
    addSound();
    numberOfTaps += 1;
    tappedEl.textContent = numberOfTaps;
    pressedKey = getCorrespondingBtn(e.keyCode);
    pressedKey.classList.add("pressed");
    const checkIsTrue = checkpressedKey(demandedKey, e.keyCode);

    if (checkIsTrue) {
      updateCurrentScore();
      deleteOldCharacter();
      getNewKey();
    } else {
      resetGame();
    }
    isPressed = true;
  }
};

const keyDisactive = () => {
  pressedKey?.classList.remove("pressed");
  isPressed = false;
};

window.addEventListener("keydown", keyActive);
window.addEventListener("keyup", keyDisactive);

startBtn.addEventListener("click", startTheGame);
resumeBtn.addEventListener("click", resumeTime);
stopBtn.addEventListener("click", stopTime);

const handleActionBtn = (e) => {
  actionBtns.forEach((e) => e.classList.remove("btnActive"));
  actionBtns.forEach((e) => (e.disabled = false));
  e.classList.add("btnActive");
  e.disabled = true;
};

actionBtns.forEach((e) =>
  e.addEventListener("click", () => handleActionBtn(e))
);

const focusOnStart = () => {
  startBtn.focus();
};

showBestScore();
