const getEl = id => document.getElementById(id)
const setStyle = (el, prop, val) => el.style[prop] = val
const setAttr = (el, attr, val) => el.setAttribute(attr, val)
const addClass = (el, name) => el.classList.add(name)
const removeClass = (el, name) => el.classList.remove(name)
const resetStyles = el => el.removeAttribute('style')
const getChild = (el, index) => el.childNodes[index]
const setElPos = (el, x, y) => {
  setStyle(el, 'left', x)
  setStyle(el, 'top', y)
}
const removeAllChildren = el => {
  while (el.hasChildNodes()) {
    if(el.lastChild) el.removeChild(el.lastChild)
  }
}
const resetAllTimeouts = () => {
  let id = window.setTimeout(() => {}, 0)
  while(id--) {
    window.clearTimeout(id)
  }
}

const WRAPPER = getEl('wrapper'),
      IMAGE = getEl('image'),
      WHITE_BLOCKS = getEl('white-blocks'),
      PARTICLES = getEl('particles')

let STATE = {
  ANIM_DURATION: 2000,
  MOUNT: {
    X: 0,
    Y: 0
  },
  BLOCKS:{
    SIZE: 20,
    INDEX: 0
  },
  IMAGE:{
    COMPLETE: false
  },
  TOTAL_PARTICLES: 0,
  COLOR_INDEX: 0
}

let COLORS = [
        'rgb(239,83,80)', // light red
        'rgb(211,47,47)', // med red
        'rgb(183,28,28)', // dark red
        'rgb(255,112,67)', // light orange
        'rgb(255,87,34)', // med orange
        'rgb(216,67,21)', // dark orange
        'rgb(255,213,79)', // light yellow
        'rgb(255,193,7)', // med yellow
        'rgb(255,160,0)', // dark yellow
        'rgb(102,187,106)', // light green
        'rgb(67,160,71)', // med green
        'rgb(27,94,32)', // dark green
        'rgb(41,182,246)', // light blue
        'rgb(25,118,210)', // med blue
        'rgb(40,53,147)', // dark blue
        'rgb(126,87,194)', // light indigo
        'rgb(94,53,177)', // med indigo
        'rgb(69,39,160)', // dark indigo
        'rgb(171,71,188)', // light violet
        'rgb(142,36,170)', // med violet
        'rgb(74,20,140)', // dark violet
      ]

const createWhiteBlock = (x, y) => {
  const block = document.createElement('div')
  addClass(block, 'block')
  addClass(block, 'visible')
  setElPos(block, x + 'px', y + 'px')
  return block
}

const appendWhiteBlocks = () => {
  for(let i = 0; i < IMAGE.clientHeight; i+=20){
    for(let j = 0; j < IMAGE.clientWidth; j+=20){
      let block = createWhiteBlock(j, i)
      WHITE_BLOCKS.appendChild(block)
      setTimeout(() => {
        addClass(block, 'hidden')
        setTimeout(() => {
          removeClass(block, 'hidden')
          addClass(block, 'visible')
        }, (i + j) * 1)
      }, (i + j) * 1)
    }
  }
}

const addFlight = particle => {
  if(!STATE.IMAGE.COMPLETE){
    STATE.ANIM_DURATION = 2000
    setStyle(particle, 'animation-duration', STATE.ANIM_DURATION + 'ms')
    addClass(particle, 'in-flight')
  }
  else{
    STATE.ANIM_DURATION = 3000
    setStyle(particle, 'animation-duration', STATE.ANIM_DURATION + 'ms')
    addClass(particle, 'in-flight-fade')
  }
}

const removeFlight = particle => {
  if(!STATE.IMAGE.COMPLETE){
    removeClass(particle, 'in-flight')
  }
  else{
    removeClass(particle, 'in-flight-fade')
  }
}

const createParticle = (x, y) => {
  const particle = document.createElement('div')
  addClass(particle, 'particle')
  addFlight(particle)
  setStyle(particle, 'background-color', COLORS[STATE.COLOR_INDEX])
  setAttr(particle, 'data-x', x)
  setAttr(particle, 'data-y', y)
  setElPos(particle, x + 'px', y + 'px')
  ++STATE.TOTAL_PARTICLES
  return particle
}

const bumpColorIndex = () => {
  if(STATE.TOTAL_PARTICLES % 10 === 0){
    if(STATE.COLOR_INDEX < COLORS.length - 1){
      ++STATE.COLOR_INDEX
    }
    else{
      STATE.COLOR_INDEX = 0
    }
  }
}

const getNextParticleMountPos = () => {
  const offsetX = IMAGE.getBoundingClientRect().left,
        offsetY = IMAGE.getBoundingClientRect().top,
        x = offsetX + (STATE.MOUNT.X * STATE.BLOCKS.SIZE),
        y = offsetY + (STATE.MOUNT.Y * STATE.BLOCKS.SIZE)
  return {x, y}
}

const bumpMountPos = () => {
  const maxInd = (IMAGE.clientWidth / STATE.BLOCKS.SIZE) - 1
  
  if(STATE.MOUNT.X === maxInd && STATE.MOUNT.Y === maxInd){
    STATE.IMAGE.COMPLETE = true
    return
  }
  
  if(STATE.MOUNT.X < maxInd){
    STATE.MOUNT.X++
  }
  else{
    STATE.MOUNT.X = 0
    STATE.MOUNT.Y++
  }
}

const removeParticle = particle => {
  if(particle && particle.parentNode === PARTICLES) 
    PARTICLES.removeChild(particle)
}

const mountParticle = particle => {
  const pos = getNextParticleMountPos()
  setElPos(particle, pos.x + 'px', pos.y + 'px')
  setStyle(particle, 'transform', 'rotate(-360deg)')
  bumpMountPos()
  setTimeout(() => {
    addClass(particle, 'hidden')
    setTimeout(() => {
      removeParticle(particle)
    }, 500)
  }, 1000)
}

const uncoverBlock = () => {
  setTimeout(() => {
    const block = getChild(WHITE_BLOCKS, STATE.BLOCKS.INDEX)
    if(block){
      removeClass(block, 'visible')
      addClass(block, 'hidden')
    }
    STATE.BLOCKS.INDEX++
  }, 1000)
}

const addStatic = particle => {
  if(!STATE.IMAGE.COMPLETE){
    addClass(particle, 'static')
  }
  else{
    addClass(particle, 'static-fade')
  }
}

const throwParticle = particle => {
  PARTICLES.appendChild(particle)
  setTimeout(() => {
    removeFlight(particle)
    addStatic(particle)
    if(!STATE.IMAGE.COMPLETE){
      mountParticle(particle)
      uncoverBlock()
    }
    else{
      setTimeout(() => {
        addClass(particle, 'hidden')
        setTimeout(() => {
          removeParticle(particle)
        }, 500)
      }, 100)
    }
  }, STATE.ANIM_DURATION - 200)
}

const initializeMouseParticleEffect = (x, y) => {
  const particle = createParticle(x, y)
  bumpColorIndex()
  throwParticle(particle)
}

const reset = () => {
  STATE = {
    ANIM_DURATION: 2000,
    MOUNT: {
      X: 0,
      Y: 0
    },
    BLOCKS:{
      SIZE: 20,
      INDEX: 0
    },
    IMAGE:{
      COMPLETE: false
    },
    TOTAL_PARTICLES: 0,
    COLOR_INDEX: 0
  }
  resetAllTimeouts()
  setTimeout(() => {
    removeAllChildren(WHITE_BLOCKS)
    removeAllChildren(PARTICLES)
    appendWhiteBlocks()
  }, 500)
}

window.onmousemove = _.throttle(e => {
  initializeMouseParticleEffect(e.clientX, e.clientY)
}, 16.66)

window.onload = () => {
  appendWhiteBlocks()
}

window.onresize = _.throttle(() => {
  reset()
}, 1000)