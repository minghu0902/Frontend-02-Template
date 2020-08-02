
function getStyle(element) {
  if (!element.style) {
    element.style = {}
  }
  for (const prop in element.computedStyle) {
    let value = element.computedStyle[prop].value
    if (value.toString().match(/px$/) || value.toString().match(/^[0-9\.]+$/)) {
      value = parseInt(value, 10)
    }
    element.style[prop] = value
  }
  return element.style
}

module.exports = function (element) {

  if (!element.computedStyle) return

  const style = getStyle(element)

  if (style.display !== 'flex') return

  const childs = element.children.filter(item => item.type === 'element')

  childs.sort((a, b) => {
    return (a.order || 0) - (b.order || 0)
  });

  ['width', 'height'].forEach(prop => {
    if (style[prop] === 'auto' || style[prop] === '') {
      style[prop] = null
    }
  })

  if (!style.flexDirection || style.flexDirection === 'auto') {
    style.flexDirection = 'row'
  }
  if (!style.alignItems || style.alignItems === 'auto') {
    style.alignItems = 'stretch'
  }
  if (!style.justifyContent || style.justifyContent === 'auto') {
    style.justifyContent = 'flex-start'
  }
  if (!style.flexWrap || style.flexWrap === 'auto') {
    style.flexWrap = 'nowrap'
  }
  if (!style.alignContent || style.alignContent === 'auto') {
    style.alignContent = 'stretch'
  }

  let mainSize, mainStart, mainEnd, mainSign, mainBase,
      crossSize, crossStart, crossEnd, crossSign, crossBase
    
  if (style.flexDirection === 'row') {
    mainSize = 'width'
    mainStart = 'left'
    mainEnd = 'right'
    mainSign = +1
    mainBase = 0

    crossSize = 'height'
    crossStart = 'top'
    crossEnd = 'bottom'
  } else if (style.flexDirection === 'row-reverse') {
    mainSize = 'width'
    mainStart = 'right'
    mainEnd = 'left'
    mainSign = -1
    mainBase = style.width

    crossSize = 'height'
    crossStart = 'bottom'
    crossEnd = 'top'
  } else if (style.flexDirection === 'column') {
    mainSize = 'height'
    mainStart = 'top'
    mainEnd = 'bottom'
    mainSign = +1
    mainBase = 0

    crossSize = 'width'
    crossStart = 'left'
    crossEnd = 'right'
  } else if (style.flexDirection === 'column-reverse') {
    mainSize = 'height'
    mainStart = 'bottom'
    mainEnd = 'top'
    mainSign = -1
    mainBase = style.height

    crossSize = 'width'
    crossStart = 'left'
    crossEnd = 'right'
  }

  if (style.flexWrap === 'wrap-reverse') {
    const tmp = crossStart
    crossStart = crossEnd
    crossEnd = tmp
    crossSign = -1
  } else {
    crossBase = 0
    crossSign = +1
  }

  let isAutoMainSize = false
  if (!style[mainSize]) {
    style[mainSize] = 0
    for (let i = 0; i < childs.length; i++) {
      const childStyle = getStyle(childs[i])
      if (childStyle[mainSize] != null) {
        style[mainSize] += childStyle[mainSize]
      }
    }
    isAutoMainSize = true
  }

  let flexLine = []
  let flexLines = [flexLine]
  let mainSpace = style[mainSize]
  let crossSpace = 0

  for (let i = 0; i < childs.length; i++) {
    const child = childs[i]
    const childStyle = getStyle(child)
    if (childStyle[mainSize] === null) {
      childStyle[mainSize] = 0
    }
    if (childStyle.flex) {
      flexLine.push(child)
    } else if (childStyle.flexWrap === 'nowrap' && isAutoMainSize) {
      mainSpace -= childStyle[mainSize]
      if (childStyle[crossSize] != null) {
        crossSpace = Math.max(crossSpace, childStyle[crossSize])
      }
      flexLine.push(child)
    } else {
      if (childStyle[mainSize] > style[mainSize]) {
        childStyle[mainSize] = style[mainSize]
      }
      if (mainSpace < childStyle[mainSize]) {
        flexLine.mainSpace = mainSpace
        flexLine.crossSpace = crossSpace
        flexLine = [child]
        flexLines.push(flexLine)
        mainSpace = style[mainSize]
        crossSpace = 0
      } else {
        flexLine.push(child)
      }
      if (childStyle[crossSize] != null) {
        crossSpace = Math.max(crossSpace, childStyle[crossSize])
      }
      mainSpace -= childStyle[mainSize]
    }
  }

  flexLine.mainSpace = mainSpace

  // 主轴方向计算
  // 找出所有flex元素
  // 把主轴方向的剩余尺寸按比例分配给这些元素
  // 若剩余空间为负数，所有flex元素为0，等比压缩剩余元素

  if (style.flexWrap === 'nowrap' || isAutoMainSize) {
    flexLine.crossSpace = style[crossSize] != null ? style[crossSize] : crossSpace
  } else {
    flexLine.crossSpace = crossSpace
  }

  if (mainSpace < 0) {
    const scale = style[mainSize] / (style[mainSize] - mainSpace)
    let currentMain = mainBase

    for (let i = 0; i < childs.length; i++) {
      const child = childs[i]
      const childStyle = getStyle(child)

      if (childStyle.flex) {
        childStyle[mainSize] = 0
      }
      childStyle[mainSize] *= scale
      childStyle[mainStart] = currentMain
      childStyle[mainEnd] = childStyle[mainStart] + mainSign * childStyle[mainSize]
      currentMain = childStyle[mainEnd]
    }
  } else {
    flexLines.forEach(items => {
      const mainSpace = items.mainSpace
      let flexTotal = 0

      for (let i = 0; i < items.length; i++) {
        const child = items[i]
        const childStyle = getStyle(child)
        
        if (childStyle.flex != null) {
          flexTotal += childStyle.flex
        }
      }

      if (flexTotal > 0) {
        let currentMain = mainBase
        
        for (let i = 0; i < items.length; i++) {
          const child = items[i]
          const childStyle = getStyle(child)

          if (childStyle.flex) {
            childStyle[mainSize] = (mainSpace / flexTotal) * childStyle.flex
          }
          childStyle[mainStart] = currentMain
          childStyle[mainEnd] = childStyle[mainStart] + mainSign * childStyle[mainSize] 
          currentMain = childStyle[mainEnd]
        }
      } else {
        let currentMain = mainBase
        let step = 0
        
        if (style.justifyContent === 'flex-start') {
          currentMain = mainBase
          step = 0
        } else if (style.justifyContent === 'flexEnd') {
          currentMain = mainSpace * mainSign + mainBase
          step = 0
        } else if (style.justifyContent === 'center') {
          currentMain = mainSpace / 2 * mainSign + mainBase
          step = 0
        } else if (style.justifyContent === 'space-between') {
          currentMain = mainBase
          step = mainBase / (items.length - 1) * mainSign
        } else if (style.justifyContent === 'space-around') {
          currentMain = mainBase
          step = mainSpace / item.length * mainSign
        }
        for (let i = 0; i < items.length; i++) {
          const child = items[i]
          const childStyle = getStyle(child)

          childStyle[mainStart] = currentMain
          childStyle[mainEnd] = childStyle[mainStart] + mainSign * childStyle[mainSize]
          currentMain = childStyle[mainEnd] + step
        }
      }
    })
  }

  // 交叉轴计算
  // 根据每一行中最大元素尺寸计算行高
  // 根据行高flex-align和item-align，确定元素具体位置

  if (!style[crossSize]) {
    crossSpace = 0
    style[crossSize] = 0
    for (let i = 0; i < flexLines.length; i++) {
      style[crossSize] = style[crossSize] + flexLines[i].crossSpace
    }
  } else {
    crossSpace = style[crossSize]
    for (let i = 0; i < flexLines.length; i++) {
      crossSpace -= flexLines[i].crossSpace
    }
  }

  if (style.flexWrap === 'wrap-reverse') {
    crossBase = style[crossSize]
  } else {
    crossBase = 0
  }

  let lineSize = style[crossSize] / flexLines.length

  let step = 0
  if (style.alignContent === 'flex-start') {
    crossBase += 0
    step = 0
  } else if (style.alignContent === 'flex-end') {
    crossBase += crossSign * crossSpace
    step = 0
  } else if (style.alignContent === 'center') {
    crossBase += crossSign * crossSpace / 2
    step = 0
  } else if (style.alignContent === 'space-between') {
    crossBase += 0
    step = crossSpace / (flexLines.length - 1)
  } else if (style.alignContent === 'space-around') {
    step = crossSpace / (flexLines.length)
    crossBase += crossSign * step / 2
  } else if (style.alignContent === 'stretch') {
    crossBase += 0
    step = 0
  }
  flexLines.forEach(items => {
    const lineCrossSize = style.alignContent === 'stretch' ?
          items.crossSpace + crossSpace / flexLines.length :
          items.crossSpace
    
    for (let i = 0; i < items.length; i++) {
      const child = items[i]
      const childStyle = getStyle(child)
      const align = childStyle.alignSelf || style.alignItems

      if (child === null) {
        childStyle[crossSize] = align === 'stretch' ? lineCrossSize : 0
      }
      if (align === 'flex-start') {
        childStyle[crossStart] = crossBase
        childStyle[crossEnd] = childStyle[crossStart] + crossSign * childStyle[crossSize]
      } else if (align === 'flex-end') {
        childStyle[crossEnd] = crossBase + crossSign * lineCrossSize
        childStyle[crossStart] = childStyle[crossEnd] - crossSign * childStyle(crossSign)
      } else if (align === 'center') {
        childStyle[crossStart] = crossBase + crossSign * (lineCrossSize - childStyle[crossSize]) / 2
        childStyle[crossEnd] = childStyle[crossStart] + crossSign * childStyle[crossSize]
      } else if (align === 'stretch') {
        childStyle[crossStart] = crossBase
        childStyle[crossEnd] = crossBase + crossSign * childStyle[crossSize]
        childStyle[crossSize] = crossSign * childStyle[crossSize]
      }
    }
    crossBase += crossSign * (lineCrossSize + step)
  })
}
