export class Recognizer {

  constructor(dispatcher) {
    this.dispatcher = dispatcher
  }

  start(point, context) {
    context.isTap = true
    context.isPan = false
    context.isPress = false
    context.startX = point.clientX
    context.startY = point.clientY
    context.points = [{
      t: Date.now(),
      x: point.clientX,
      y: point.clientY
    }]

    this.dispatcher.dispatch('start', {
      clientX: point.clientX,
      clientY: point.clientY
    })
  
    context.handler = setTimeout(() => {
      context.isTap = false
      context.isPress = true
      context.isPan = false
      context.handler = null
      this.dispatcher.dispatch('pressstart', {
        clientX: point.clientX,
        clientY: point.clientY
      })
    }, 500)
  }

  move(point, context) {
    let dx = point.clientX - context.startX
    let dy = point.clientY - context.startY
  
    if (!context.isPan && dx ** 2 + dy ** 2 >= 100) {
      context.isTap = false
      context.isPress = false
      context.isPan = true
      context.isVertical = Math.abs(dx) < Math.abs(dy)
      clearTimeout(context.handler)
      this.dispatcher.dispatch('panstart', {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical
      })
    }
    if (context.isPan) {
      this.dispatcher.dispatch('pan', {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical
      })
    }
  
    context.points = context.points.filter(point => Date.now() - point.t < 500)
  
    context.points.push({
      t: Date.now(),
      x: point.clientX,
      y: point.clientY
    })  
  }

  end(point, context) {
    if (context.isTap) {
      this.dispatcher.dispatch('tap', {
        clientX: point.clientX,
        clientY: point.clientY
      })
      clearTimeout(context.handler)
    }
  
    if (context.isPress) {
      this.dispatcher.dispatch('pressend', {
        clientX: point.clientX,
        clientY: point.clientY
      })
    }
    
    const d = Math.sqrt(
      (point.clientX - context.points[0].x) ** 2 +
      (point.clientY - context.points[0].y) ** 2
    )
    const v = d / (Date.now() - context.points[0].t)

    if (v > 1.5) {
      context.isFlick = true
      this.dispatcher.dispatch('flick', {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical,
        isFlick: context.isFlick,
        velocity: v
      })
    } else {
      context.isFlick = false
    }
  
    if (context.isPan) {
      this.dispatcher.dispatch('panend', {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical,
        isFlick: context.isFlick,
        velocity: v
      })
    }

    this.dispatcher.dispatch('end', {
      startX: context.startX,
      startY: context.startY,
      clientX: point.clientX,
      clientY: point.clientY,
      isVertical: context.isVertical,
      isFlick: context.isFlick,
      velocity: v
    })
  }

  cancel(point, context) {
    clearTimeout(context.handler)
    this.dispatcher.dispatch('cancel', {})
  }
}