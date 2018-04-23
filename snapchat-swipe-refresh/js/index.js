var TIME = document.getElementById('time'),
    SCREEN = document.getElementById('screen'),
    APP = document.getElementById('app'),
    REFRESH_BAR = document.getElementById('refresh-bar'),
    REFRESH_ICON = document.getElementById('refresh-icon');

var isMouseDown = false,
    hasSwipedDown = false,
    mouseDownPos = 0,
    rand = 1,
    _500Timer = null,
    _1000Timer = null,
    _2000Timer = null;

var setElementStyle = function setElementStyle(element, property, value) {
  return element.style[property] = value;
};
var resetElementStyles = function resetElementStyles(element) {
  return element.removeAttribute('style');
};
var addClassToElement = function addClassToElement(element, className) {
  return element.classList.add(className);
};
var removeClassFromElement = function removeClassFromElement(element, className) {
  return element.classList.remove(className);
};

var setTime = function setTime() {
  var h1 = TIME.getElementsByTagName('h1')[0];
  var currentTime = moment().format("h:mm");
  h1.innerHTML = currentTime;
};

var toggleRandomColorRotateClass = function toggleRandomColorRotateClass(isAdd) {
  if (isAdd) rand = Math.floor(Math.random() * 4) + 1;
  var color = '';
  switch (rand) {
    case 1:
      color = 'green';
      break;
    case 2:
      color = 'yellow';
      break;
    case 3:
      color = 'red';
      break;
    case 4:
      color = 'purple';
      break;
  }

  if (isAdd) {
    addClassToElement(REFRESH_BAR, color);
  } else {
    removeClassFromElement(REFRESH_BAR, color);
  }
};

var resetRefreshEvents = function resetRefreshEvents() {
  toggleRandomColorRotateClass(false);
  removeClassFromElement(REFRESH_BAR, 'zoom');
  removeClassFromElement(REFRESH_ICON, 'hide');
  removeClassFromElement(REFRESH_ICON, 'zoom');
  clearTimeout(_500Timer);
  clearTimeout(_1000Timer);
  clearTimeout(_2000Timer);
};

var endScreenSwipe = function endScreenSwipe() {
  if (isMouseDown && hasSwipedDown) {
    resetElementStyles(REFRESH_BAR);
    resetElementStyles(REFRESH_ICON);
    removeClassFromElement(APP, 'dragging');
    addClassToElement(SCREEN, 'disable');
    addClassToElement(REFRESH_BAR, 'zoom');
    toggleRandomColorRotateClass(true);
    addClassToElement(REFRESH_ICON, 'zoom');

    _500Timer = setTimeout(function () {
      removeClassFromElement(SCREEN, 'disable');
      removeClassFromElement(REFRESH_ICON, 'zoom');
      addClassToElement(REFRESH_ICON, 'hide');
    }, 500);

    _1000Timer = setTimeout(function () {
      removeClassFromElement(REFRESH_ICON, 'hide');
    }, 1000);

    _2000Timer = setTimeout(function () {
      removeClassFromElement(REFRESH_BAR, 'zoom');
      toggleRandomColorRotateClass(false);
    }, 2000);
  }
  isMouseDown = false;
  hasSwipedDown = false;
};

var doSwipeAction = function doSwipeAction(e) {
  if (isMouseDown) {
    var mouseY = e.clientY - SCREEN.getBoundingClientRect().top - mouseDownPos,
        screenHeight = SCREEN.clientHeight,
        swipePercentage = (mouseY / screenHeight).toFixed(2),
        refreshBarHeight = Math.round(60 + swipePercentage * 150) + 'px';
    var swipePercentageFrom100 = 100 * (1 - swipePercentage * 3),
        smileyPosition = swipePercentageFrom100 < 30 ? 0 : swipePercentageFrom100;

    if (swipePercentage > 0.01) {
      hasSwipedDown = true;
      addClassToElement(APP, 'dragging');
      if (!sessionStorage.getItem('hide-hint')) {
        addClassToElement(SCREEN, 'hide-hint');
        sessionStorage.setItem('hide-hint', true);
      }

      setElementStyle(REFRESH_BAR, 'height', refreshBarHeight);
      setElementStyle(REFRESH_ICON, 'transform', 'translateX(-50%) translateY(calc(' + smileyPosition + '% - 4px)');
    }
  }
};

SCREEN.onmousemove = function (e) {
  doSwipeAction(e);
};

SCREEN.onmousedown = function (e) {
  var mouseY = e.clientY - SCREEN.getBoundingClientRect().top,
      screenHeight = SCREEN.clientHeight;

  isMouseDown = true;
  mouseDownPos = mouseY;

  resetRefreshEvents();
};

SCREEN.onmouseup = function (e) {
  endScreenSwipe();
};

SCREEN.onmouseleave = function (e) {
  endScreenSwipe();
};

window.onload = function () {
  setInterval(function () {
    return setTime();
  }, 1000);
  if (sessionStorage.getItem('hide-hint')) sessionStorage.removeItem('hide-hint');
};