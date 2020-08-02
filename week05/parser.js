const css = require('css')
const images = require('images')
const layout = require('./layout')

let currentToken = null
let currentAttribute = null
let currentTextNode = null
let stack = [{ type: 'document', children: [] }]
const EOF = Symbol('EOF')


let rules = []
function addCSSRule(text) {
  const ast = css.parse(text)
  rules = rules.concat(ast.stylesheet.rules)
}

function computed(element, stack) {
  const elements = stack.slice().reverse()

  for (const rule of rules) {
    const selectors = rule.selectors[0].split(' ').reverse()

    if (!match(element, selectors[0])) continue

    let matched = false
    let j = 1
    for (let i = 0; i < elements.length; i++) {
      if (match(elements[i], selectors[i])) {
        j++
      }
    }
    if (j >= selectors.length) {
      matched = true
    }

    if (matched) {
      element.computedStyle = element.computedStyle || {}
      const computedStyle = element.computedStyle
      for (const declaration of rule.declarations) {
        if (!computedStyle[declaration.property]) {
          computedStyle[declaration.property] = {}
        }
        computedStyle[declaration.property].value = declaration.value
      }
    }
  }
}

function specificity(selector) {
  const p = [0, 0, 0, 0]
  const selectorParts = selector.split(' ')

  for (const part of selectorParts) {
    if (part.startsWith('#')) {
      p[1] += 1
    } else if (part.startsWith('.')) {
      p[2] += 1
    } else {
      const reg = /^(([a-z]+\d?)|([\.#][a-zA-Z0-9]+)).*$/
      let str = selector
      let index = 0

      while(str.length && reg.test(str)) {
        const result = RegExp.$1
  
        if (result.startsWith('.')) {
          p[2] += 1
        } else if (result.startsWith('#')) {
          p[1] += 1
        } else {
          p[3] += 1
        }
  
        index = str.indexOf(result) + result.length
        str = str.slice(index)
      }
    }
  }

  return p
}

function match(element, selector) {

  if (!selector || !element || !element.attributes) {
    return false
  }

  const classSelectorMatch = (selector) => {
    const attr = element.attributes.find(item => item.name === 'class')
    if (attr && attr.value.includes(selector.replace('.', ''))) {
      return true
    }
    return false
  } 

  const idSelectorMatch = (selector) => {
    const attr = element.attributes.find(item => item.name === 'id')
    if (attr && attr.value.includes(selector.replace('#', ''))) {
      return true
    }
    return false
  }

  const mixSelectorMath = (selector) => {
    const reg = /^(?:[a-z]+\d?)?([\.#][a-zA-Z0-9]+).*$/
    let str = selector
    let index = 0

    while(reg.test(str)) {
      const result = RegExp.$1

      if (result.startsWith('.')) {
        if (!classSelectorMatch(result)) return false
      } else if (result.startsWith('#')) {
        if (!idSelectorMatch(result)) return false
      } else { return false }

      index = str.indexOf(result) + result.length
      str = str.slice(index)
    }

    if (str === '') {
      return true
    }

    return false
  }

  if (selector.startsWith('#')) {
    // id 选择器
    return idSelectorMatch(selector)
  } else if (selector.startsWith('.')) {
    // class 选择器
    return classSelectorMatch(selector)
  } else if (element.tagName === selector) {
    // 元素选择器
    return true
  } else {
    // 复合选择器
    return mixSelectorMath(selector)
  }
}

function emit(token) {

  let top = stack[stack.length - 1]

  if (token.type === 'startTag') {
    let element = {
      type: 'element',
      tagName: token.tagName,
      children: [],
      attributes: []
    }

    for (const k in token) {
      if (k !== 'type' && k !== 'tagName') {
        element.attributes.push({
          name: k,
          value: token[k]
        })
      }
    }
    
    top.children.push(element)
    element.parent = top

    if (!token.isSelfClosing) {
      stack.push(element)
    }
    currentTextNode = null
  } else if (token.type === 'endTag') {
    if (top.tagName !== token.tagName) {
      throw new Error('Tag start end doesn\'t match!')
    } else {
      if (top.tagName === 'style') {
        addCSSRule(top.children[0].content)
      } else {
        computed(top, stack)
        layout(top)
      }
      stack.pop()
    }
    currentTextNode = null
  } else if (token.type === 'text') {
    if (!currentTextNode) {
      currentTextNode = {
        type: 'text',
        content: ''
      }
      top.children.push(currentTextNode)
    }
    currentTextNode.content += token.content
  }
}

function data(c) {
  if (c === '<') {
    return tagOpen
  } else if (c === EOF) {
    emit({
      type: 'EOF'
    })
    return ;
  } else {
    emit({
      type: 'text',
      content: c
    })
    return data
  }
}

function tagOpen(c) {
  if (c === '/') {
    return endTagOpen
  } else if (c.match(/^[a-zA-Z]$/)) {
    currentToken = {
      type: 'startTag',
      tagName: ''
    }
    return tagName(c)
  } else {
    return ;
  }
}

function endTagOpen(c) {
  if (c.match(/^[a-zA-Z]$/)) {
    currentToken = {
      type: 'endTag',
      tagName: ''
    }
    return tagName(c)
  } else if (c === '>') {

  } else if (c === EOF) {

  } else {

  }
}

function tagName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName
  } else if (c === '/') {
    return selfClosingStartTag
  } else if (c.match(/^[a-zA-Z]$/)) {
    currentToken.tagName += c
    return tagName
  } else if (c === '>') {
    emit(currentToken)
    return data
  } else {
    return tagName
  }
}

function attributeName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return afterAttibuteName(c)
  } else if (c === '=') {
    return beforeAttributeValue
  } else if (c === '\u0000') {

  } else if (c === '"' || c === '\'' || c === '<') {

  } else {
    currentAttribute.name += c
    return attributeName
  }
}

function beforeAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/) || c === '/' || c === '>' || c === EOF) {
    return beforeAttributeValue
  } else if (c === '"') {
    return doubleQuotedAttributeValue 
  } else if (c === '\'') {
    return singleQuotedAttributeValue
  } else if (c === '>') {

  } else {
    return unquotedAttributeValue
  }
}

function doubleQuotedAttributeValue(c) {
  if (c === '"') {
    currentToken[currentAttribute.name] = currentAttribute.value
    return afterQuotedAttributeValue
  } else if (c === '\u0000') {

  } else if (c === EOF) {

  } else {
    currentAttribute.value += c
    return doubleQuotedAttributeValue
  }
}

function singleQuotedAttributeValue(c) {
  if (c === '\'') {
    currentToken[currentAttribute.name] = currentAttribute.value
    return afterQuotedAttributeValue
  } else if (c === '\u0000') {

  } else if (c === EOF) {

  } else {
    currentAttribute.value += c
    return singleQuotedAttributeValue
  }
}

function unquotedAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    currentToken[currentAttribute.name] = currentAttribute.value
    return beforeAttributeName
  } else if (c === '/') {
    currentToken[currentAttribute.name] = currentAttribute.value
    return selfClosingStartTag
  } else if (c === '>') {
    currentToken[currentAttribute.name] = currentAttribute.value
    emit(currentToken)
    return data
  } else if (c === '\u0000') {

  } else if (c === '"' || c === '\'' || c === '<' || c === '=') {

  } else if (c === EOF) {

  } else {
    currentAttribute.value += c
    return unquotedAttributeValue
  }
}

function afterQuotedAttributeValue(c) {
  if (c.match(/^[\t\f\n ]$/)) {
    return beforeAttributeName
  } else if (c === '/') {
    return selfClosingStartTag
  } else if (c === '>') {
    currentToken[currentAttribute.name] = currentAttribute.value
    emit(currentToken)
    return data
  } else if (c === EOF) {

  } else {
    currentAttribute.value += c
    return doubleQuotedAttributeValue
  }
}

function beforeAttributeName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName
  } else if (c === '/' || c === '>' || c === EOF) {
    return afterAttibuteName(c)
  } else if (c === '=') {

  } else {
    currentAttribute = {
      name: '',
      value: ''
    }
    return attributeName(c)
  }
}

function afterAttibuteName(c) {

}

function selfClosingStartTag(c) {

}

module.exports = function (html) {
  let state = data
  for (const c of html) {
    state = state(c)
  }
  state = state(EOF)
  
  return stack[0]
}