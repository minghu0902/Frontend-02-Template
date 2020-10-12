export class Listener {

  constructor(element, recognizer) {
    this.element = element
    this.recognizer = recognizer

    const contextMap = new Map()
    let isListeningMouse = false

    element.addEventListener('mousedown', (event) => {
      const context = Object.create(null)
      contextMap.set('mouse' + (1 << event.button), context)
      this.recognizer.start(event, context)

      const mousemove = (event) => {
        const buttons = event.buttons
        let button = 1

        while(button <= buttons) {
          if (button & buttons) {
            // buttons和button值的中键和右键顺序不一样，需要交换一下位置
            let key
            if (button === 2) {
              key = 4
            } else if (button === 4) {
              key = 2
            } else {
              key = button
            }
            this.recognizer.move(event, contextMap.get('mouse' + key))
          }
          button = button << 1
        }
      }
      const mouseup = (event) => {
        this.recognizer.end(event, contextMap.get('mouse' + (1 << event.button)))
        contextMap.delete('mouse' + (1 << event.button))
        
        if (event.buttons === 0) {
          element.removeEventListener('mousemove', mousemove)
          element.removeEventListener('mouseup', mouseup)
          isListeningMouse = false
        }
      }

      if (!isListeningMouse) {
        element.addEventListener('mousemove', mousemove)
        element.addEventListener('mouseup', mouseup)
        isListeningMouse = true
      }
    })

    element.addEventListener('touchstart', (event) => {
      for (const touch of event.changedTouches) {
        let context = Object.create(null)
        contextMap.set(touch.identifier, context)
        this.recognizer.start(touch, context)
      }
    })

    element.addEventListener('touchmove', (event) => {
      for (const touch of event.changedTouches) {
        this.recognizer.move(touch, contextMap.get(touch.identifier))
      }
    })

    element.addEventListener('touchend', (event) => {
      for (const touch of event.changedTouches) {
        this.recognizer.end(touch, contextMap.get(touch.identifier))
        contextMap.delete(touch.identifier)
      }
    })

    element.addEventListener('touchcancel', (event) => {
      for (const touch of event.changedTouches) {
        this.recognizer.cancel(touch, contextMap.get(touch.identifier))
        contextMap.delete(touch.identifier)
      }
    })
  }
}