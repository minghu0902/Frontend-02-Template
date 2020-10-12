import { Listener } from './core/Listener'
import { Recognizer } from './core/Recognizer'
import { Dispatcher } from './core/Dispatcher'

export function enableGesture(element) {
  new Listener(element, new Recognizer(new Dispatcher(element)))
}

export {
  Listener,
  Recognizer,
  Dispatcher
}
