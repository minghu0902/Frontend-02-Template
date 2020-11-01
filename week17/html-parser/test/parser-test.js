import assert from 'assert'
import parser from '../src/parser'

describe('parser html', () => {
  
  it('<a></a>', () => {
    let tree = parser('<a></a>')
    assert.equal(tree.children.length, 1)
    assert.equal(tree.children[0].type, 'element')
    assert.equal(tree.children[0].tagName, 'a')
  })

  it('<a />', () => {
    let tree = parser('<a />')
    assert.equal(tree.children.length, 1)
    assert.equal(tree.children[0].type, 'element')
    assert.equal(tree.children[0].tagName, 'a')
  })

  it('<a href="/"></a>', () => {
    let tree = parser('<a href="/"></a>')
    assert.equal(tree.children.length, 1)
    assert.equal(tree.children[0].type, 'element')
    assert.equal(tree.children[0].tagName, 'a')
    assert.equal(tree.children[0].attributes.length, 1)
  })

  it('<a href ></a>', () => {
    let tree = parser('<a href ></a>')
    assert.equal(tree.children.length, 1)
    assert.equal(tree.children[0].type, 'element')
    assert.equal(tree.children[0].tagName, 'a')
  })

  it('<a id=abc ></a>', () => {
    let tree = parser('<a id=abc ></a>')
    assert.equal(tree.children.length, 1)
    assert.equal(tree.children[0].type, 'element')
    assert.equal(tree.children[0].tagName, 'a')
  })

  it('<a id=abc></a>', () => {
    let tree = parser('<a id=abc></a>')
    assert.equal(tree.children.length, 1)
    assert.equal(tree.children[0].type, 'element')
    assert.equal(tree.children[0].tagName, 'a')
  })

  it('<a id=abc />', () => {
    let tree = parser('<a id=abc />')
    assert.equal(tree.children.length, 1)
    assert.equal(tree.children[0].type, 'element')
    assert.equal(tree.children[0].tagName, 'a')
  })

  it('<a id=\'abc\'></a>', () => {
    let tree = parser('<a id=\'abc\'></a>')
    assert.equal(tree.children.length, 1)
    assert.equal(tree.children[0].type, 'element')
    assert.equal(tree.children[0].tagName, 'a')
  })

  it('<a id="abc" href ></a>', () => {
    let tree = parser('<a id="abc" href ></a>')
    assert.equal(tree.children.length, 1)
    assert.equal(tree.children[0].type, 'element')
    assert.equal(tree.children[0].tagName, 'a')
  })

  it('<a>text</a>', () => {
    let tree = parser('<a>text</a>')
    assert.equal(tree.children.length, 1)
    assert.equal(tree.children[0].type, 'element')
    assert.equal(tree.children[0].tagName, 'a')
    assert.equal(tree.children[0].children[0].type, 'text')
  })

  it('123', () => {
    let tree = parser('123')
    assert.equal(tree.children.length, 1)
    assert.equal(tree.children[0].type, 'text')
    assert.equal(tree.children[0].content, '123')
  })
  
})