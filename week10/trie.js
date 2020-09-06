
const $ = Symbol('$')

class Trie {
  constructor() {
    this.root = Object.create(null)
  }
  insert(word) {
    let node = this.root
    
    for (const s of word) {
      if (!node[s]) {
        node[s] = Object.create(null)
      }
      node = node[s]
    }

    if ($ in node) {
      node[$]++
    } else {
      node[$] = 0
    }
  }
  most() {
    let node = this.root
    let max = 0
    let result = ''

    const visit = (node, word) => {
      if (node[$] && node[$] > max) {
        max = node[$]
        result = word
      }
      for (const s in node) {
        visit(node[s], word + s)
      }
    }

    visit(this.root, '')
    console.log(max)
    return result
  }
}

function randomWord(len) {
  let s = ''
  for (let i = 0; i < len; i++) {
    s += String.fromCharCode('a'.charCodeAt(0) + Math.random() * 26)
  }
  return s
}

let trie = new Trie()

for (let i = 0; i < 1000000; i++) {
  trie.insert(randomWord(5))
}

console.log(trie.most())