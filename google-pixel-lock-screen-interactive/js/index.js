var getElement = function getElement(el) {
  return document.getElementById(el);
};
var setStyle = function setStyle(el, prop, val) {
  return el.style[prop] = val;
};
var resetStyles = function resetStyles(el) {
  return el.removeAttribute('style');
};
var addClass = function addClass(el, className) {
  return el.classList.add(className);
};
var removeClass = function removeClass(el, className) {
  return el.classList.remove(className);
};
var removeChild = function removeChild(el, child) {
  if (child && child.parentNode == el) el.removeChild(child);
};
var removeLastChild = function removeLastChild(el) {
  if (el.hasChildNodes()) el.removeChild(el.lastChild);
};
var removeChildren = function removeChildren(el) {
  while (el.hasChildNodes()) {
    el.removeChild(el.lastChild);
  }
};
var isShowingEnterPinScreen = function isShowingEnterPinScreen() {
  return ENTER_PIN_SCREEN.classList.contains('showing');
};

var TIME_INFO_BOX = getElement('time-info-box'),
    TIME = getElement('time'),
    DATE = getElement('date'),
    LOCK_SCREEN = getElement('lock-screen'),
    ENTER_PIN_SCREEN = getElement('enter-pin-screen'),
    BACK_TO_LOCK_SCREEN = getElement('back-to-lock-screen'),
    ENTERED_NUMBERS = getElement('entered-numbers'),
    BACKSPACE = getElement('backspace'),
    PIN_HINT = getElement('pin-hint'),
    CONFIRM_PIN = getElement('confirm-pin'),
    EXTRA_SWIPE_HINT = getElement('extra-swipe-hint');

var VALID_PIN = '1234';

var STATE = {
  mouseDownPos: 0,
  hasSwipeStarted: false,
  isMouseDown: false,
  mouseDownTime: 0,
  enteredPin: ''
};

var setTime = function setTime() {
  var timeH1 = TIME.getElementsByTagName('h1')[0],
      dateH1 = DATE.getElementsByTagName('h1')[0];
  var currentTime = moment().format("h:mm"),
      day = moment().format("dddd"),
      monthYear = moment().format("MMMM D"),
      currentDate = day + ', ' + monthYear;
  timeH1.innerHTML = currentTime;
  dateH1.innerHTML = currentDate;
};

var removeBounceTimeout = null;
var bounceLockScreen = function bounceLockScreen() {
  addClass(LOCK_SCREEN, 'bounce');
  removeBounceTimeout = setTimeout(function () {
    return removeClass(LOCK_SCREEN, 'bounce');
  }, 800);
};

var endBounceLockScreen = function endBounceLockScreen() {
  removeClass(LOCK_SCREEN, 'bounce');
  clearTimeout(removeBounceTimeout);
};

var onScreenSwipe = function onScreenSwipe(e) {
  var top = LOCK_SCREEN.getBoundingClientRect().top,
      height = LOCK_SCREEN.clientHeight,
      mouseY = e.clientY - top - STATE.mouseDownPos,
      swipePercentage = Math.max(-0.1, (mouseY / height).toFixed(2) * -1);
  if (STATE.isMouseDown) {
    var scale = 1 - swipePercentage,
        opacity = Math.max(0, Math.min(1, 1 - swipePercentage * 2)).toFixed(2),
        translateX = 'translateX(-50%) scale3d(' + scale + ',' + scale + ',' + scale + ')';
    if (swipePercentage > 0.1) {
      STATE.hasSwipeStarted = true;
      addClass(LOCK_SCREEN, 'swiping');
    }
    setStyle(TIME_INFO_BOX, 'opacity', opacity);
    setStyle(TIME_INFO_BOX, 'transform', translateX);
    setStyle(LOCK_SCREEN, 'opacity', opacity);
  }
};

var endScreenSwipe = function endScreenSwipe() {
  STATE.isMouseDown = false;
  STATE.hasSwipeStarted = false;
  resetStyles(LOCK_SCREEN);
  resetStyles(TIME_INFO_BOX);
  removeClass(LOCK_SCREEN, 'swiping');
};

var swipeCompleted = function swipeCompleted() {
  addClass(LOCK_SCREEN, 'swipe-completed');
  removeClass(LOCK_SCREEN, 'bounce');
  addClass(ENTER_PIN_SCREEN, 'showing');
  STATE.hasSwipeStarted = false;
};

var determineSwipeSuccess = function determineSwipeSuccess() {
  var timeDiff = moment().valueOf() - STATE.mouseDownTime;
  if (timeDiff < 250) {
    if (STATE.hasSwipeStarted) {
      swipeCompleted();
      createHintCookie();
    } else {
      bounceLockScreen();
    }
  }
};

var backToLockScreen = function backToLockScreen() {
  removeClass(LOCK_SCREEN, 'swipe-completed');
  removeClass(ENTER_PIN_SCREEN, 'showing');
  clearPin();
  STATE.hasSwipeStarted = false;
};

var addToEnteredNumbers = function addToEnteredNumbers(e) {
  var num = document.createElement('div'),
      numVal = isNaN(e) ? e.currentTarget.dataset.num : e;
  addClass(num, 'num');
  num.innerText = numVal;
  ENTERED_NUMBERS.appendChild(num);
  STATE.enteredPin += numVal;
  setTimeout(function () {
    return addClass(num, 'hidden');
  }, 500);
};

var backspaceOnPin = function backspaceOnPin() {
  if (ENTERED_NUMBERS.hasChildNodes()) {
    var toBeRemoved = ENTERED_NUMBERS.lastChild;
    addClass(toBeRemoved, 'erased');
    setTimeout(function () {
      removeChild(ENTERED_NUMBERS, toBeRemoved);
      if (STATE.enteredPin.length >= 1) STATE.enteredPin = STATE.enteredPin.slice(0, -1);
    }, 100);
  }
};

var clearPin = function clearPin() {
  removeChildren(ENTERED_NUMBERS);
  STATE.enteredPin = '';
};

var removeErrorTimeout = null;
var confirmPin = function confirmPin() {
  if (STATE.enteredPin === VALID_PIN) {
    unlockedPhone();
  } else {
    addClass(PIN_HINT, 'error');
    removeErrorTimeout = setTimeout(function () {
      return removeClass(PIN_HINT, 'error');
    }, 1000);
  }
};

var unlockedPhone = function unlockedPhone() {
  addClass(ENTER_PIN_SCREEN, 'completed');
  setTimeout(function () {
    addClass(ENTER_PIN_SCREEN, 'transitioning');
    removeClass(LOCK_SCREEN, 'swipe-completed');
    removeClass(ENTER_PIN_SCREEN, 'showing');
    removeClass(ENTER_PIN_SCREEN, 'completed');
    clearPin();
    setTimeout(function () {
      return removeClass(ENTER_PIN_SCREEN, 'transitioning');
    }, 250);
  }, 680);
};

var createHintCookie = function createHintCookie() {
  if (!sessionStorage.getItem('hide-hint')) {
    addClass(EXTRA_SWIPE_HINT, 'hide-hint');
    sessionStorage.setItem('hide-hint', true);
  }
};

var destroyHintCookie = function destroyHintCookie() {
  if (sessionStorage.getItem('hide-hint')) sessionStorage.removeItem('hide-hint');
};

LOCK_SCREEN.onmousemove = function (e) {
  onScreenSwipe(e);
};

LOCK_SCREEN.onmousedown = function (e) {
  STATE.mouseDownPos = e.clientY - LOCK_SCREEN.getBoundingClientRect().top;
  STATE.isMouseDown = true;
  endBounceLockScreen();
  STATE.mouseDownTime = moment().valueOf();
};

LOCK_SCREEN.onmouseup = function () {
  determineSwipeSuccess();
  endScreenSwipe();
};

LOCK_SCREEN.onmouseleave = function () {
  if (STATE.isMouseDown) {
    determineSwipeSuccess();
    endScreenSwipe();
  }
};

BACK_TO_LOCK_SCREEN.onclick = function () {
  backToLockScreen();
};

var backSpaceInterval = null;
BACKSPACE.onmousedown = function () {
  STATE.mouseDownTime = moment().valueOf();
  backSpaceInterval = setInterval(function () {
    var timeDiff = moment().valueOf() - STATE.mouseDownTime;
    if (timeDiff >= 1000) clearPin();
  }, 100);
};

BACKSPACE.onmouseup = function () {
  var timeDiff = moment().valueOf() - STATE.mouseDownTime;
  clearInterval(backSpaceInterval);
  if (timeDiff < 1000) {
    backspaceOnPin();
  }
};

BACKSPACE.onmouseleave = function () {
  clearInterval(backSpaceInterval);
};

CONFIRM_PIN.onclick = function () {
  confirmPin();
};

CONFIRM_PIN.onmousedown = function () {
  removeClass(PIN_HINT, 'error');
  clearTimeout(removeErrorTimeout);
};

window.onkeydown = function (e) {
  if (isShowingEnterPinScreen()) {
    if (e.keyCode >= 48 && e.keyCode <= 57) {
      var num = (e.keyCode - 48).toString();
      addToEnteredNumbers(num);
    } else {
      switch (e.keyCode) {
        case 8:
          backspaceOnPin();
          break;
        case 13:
          confirmPin();
          break;
        default:
          break;
      }
    }
  }
};

window.onload = function () {
  destroyHintCookie();
  setInterval(function () {
    return setTime();
  }, 1000);
};