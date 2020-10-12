const ANIMATIONS = Symbol('animations')
const TICK = Symbol('tick')
const FRAME_HANDLER = Symbol('frameHandler')
const START_TIME = Symbol('startTime')
const PAUSE_START = Symbol('pauseStart')
const PAUSE_TIME = Symbol('pauseTime')

export class TimeLine {
  constructor() {
    this[ANIMATIONS] = new Set()
    this[START_TIME] = new Map()
    this.state = 'inited'
  }
  start() {
    if (this.state !== 'inited') {
      return
    }
    this.state = 'started'
    this[PAUSE_TIME] = 0
    const startTime = Date.now()
    this[TICK] = () => {
      const now = Date.now()
      for (const animation of this[ANIMATIONS]) {
        let t
        if (this[START_TIME].get(animation) < startTime) {
          t = now - startTime - this[PAUSE_TIME] - animation.delay
        } else {
          t = now - this[START_TIME].get(animation) - this[PAUSE_TIME] - animation.delay
        }

        if (t > animation.duration) {
          this[ANIMATIONS].delete(animation)
          t = animation.duration
        }
        if (t > 0) {
          animation.recive(t)
        }
      }

      this[FRAME_HANDLER] = requestAnimationFrame(this[TICK])
    }
    this[TICK]()
  }
  add(animation, startTime) {
    if (startTime == null) {
      startTime = Date.now()
    }
    this[ANIMATIONS].add(animation)
    this[START_TIME].set(animation, startTime)
  }
  pause() {
    if (this.state !== 'started') {
      return
    }
    this.state = 'paused'
    this[PAUSE_START] = Date.now()
    cancelAnimationFrame(this[FRAME_HANDLER])
  }
  resume() {
    if (this.state !== 'paused') {
      return
    }
    this.state = 'started'
    this[PAUSE_TIME] += Date.now() - this[PAUSE_START]
    this[TICK]()
  }
  reset() {
    this.state = 'inited'
  }
}