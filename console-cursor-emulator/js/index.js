const INPUT_FIELD = getEl('input-field'),
      INPUT_DISPLAY = getEl('input-display'),
      CURSOR = getEl('cursor')

const STATE = {
  cursorIndex: 0
}

//Bump cursor pos in increments of 12px
const moveCursor = index => {
  STATE.cursorIndex = Math.max(0, index)
  const leftPos = STATE.cursorIndex * 12
  setStyle(CURSOR, 'left', leftPos + 'px')
}

//Wipe input display, then repopulate with span tags
const appendInput = input => {
  removeAllChildren(INPUT_DISPLAY)
  for(let i = 0; i < input.length; i++){
    const span = document.createElement('span')
    span.innerHTML = input[i]
    INPUT_DISPLAY.appendChild(span)
  }
}

const handleEnter = e => {
  e.preventDefault()
  console.log('Do stuff!')
  return null
}

const handleBackspace = () => {
  const newIndex = STATE.cursorIndex - 1
  if(STATE.cursorIndex < 1) return null

  moveCursor(newIndex)
  let input = INPUT_FIELD.value
  input = input.slice(0, newIndex) + input.slice(newIndex + 1)
  appendInput(input)
}

const handleDelete = () => {
  moveCursor(STATE.cursorIndex)
  
  let input = INPUT_FIELD.value
  input = input.slice(0, STATE.cursorIndex) + input.slice(STATE.cursorIndex + 1)
  appendInput(input)
}

const handleKeyPress = e => {
  const newIndex = STATE.cursorIndex + 1
  moveCursor(newIndex)
  
  let input = INPUT_FIELD.value
  input = input.slice(0, newIndex - 1) + e.key + input.slice(newIndex - 1)
  appendInput(input)
}

const handleKeyDown = e => {
  if(e.ctrlKey){
    e.preventDefault()
    return null
  }
  else{
    switch(e.key){
      case 'Enter':
        handleEnter(e)
        break
      case 'Home':
        moveCursor(0)
        break
      case 'End':
        moveCursor(INPUT_FIELD.value.length)
        break
      case 'ArrowLeft':
        moveCursor(STATE.cursorIndex - 1)
        break
      case 'ArrowRight':
        moveCursor(STATE.cursorIndex + 1)
        break
      case 'Backspace':
        handleBackspace()
        break
      case 'Delete':
        handleDelete()
        break
      default:
        return null
    }
  }
}

//Letters, numbers, and symbols
INPUT_FIELD.onkeypress = e => handleKeyPress(e)

//Everything else
INPUT_FIELD.onkeydown = e => handleKeyDown(e)

//Move cursor to end on input focus
INPUT_FIELD.onfocus = () => INPUT_FIELD.selectionStart = INPUT_FIELD.selectionEnd = INPUT_FIELD.value.length

//Focus input on click
INPUT_DISPLAY.onclick = () => INPUT_FIELD.focus()

//Focus input on window load/click
window.onload = () => INPUT_FIELD.focus()
window.onclick = () => INPUT_FIELD.focus()