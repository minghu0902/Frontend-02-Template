export class Animation {
  constructor(obj, prop, startValue, endValue, duration, delay, timingFunc, template) {
    timingFunc = timingFunc || (v => v)
    template = template || (v => v)
    
    this.obj = obj
    this.prop = prop
    this.startValue = startValue
    this.endValue = endValue
    this.duration = duration
    this.delay = delay
    this.timingFunc = timingFunc
    this.template = template
  }
  recive(time) {
    this.obj[this.prop] = this.template(this.startValue + (this.endValue - this.startValue) * this.timingFunc(time / this.duration))
  }
}