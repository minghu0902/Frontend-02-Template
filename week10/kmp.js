
function kmp(source, pattern) {
  let table = Array(pattern.length).fill(0)
  
  // 计算回退table
  {
    let i = 1, j = 0
    while(i < pattern.length) {
      if (pattern[i] === pattern[j]) {
        i++
        j++
        table[i] = j
      } else {
        if (j > 0) {
          j = table[j]
        } else {
          i++
        }
      }
    }
  }

  console.log(table)

  // 匹配
  {
    let i = 0, j = 0

    while(i < source.length) {
      if (source[i] === pattern[j]) {
        i++
        j++
      } else {
        if (j > 0) {
          j = table[j]
        } else {
          i++
        }
      }
      if (j === pattern.length) {
        return true
      }
    }

    return false
  }
}

console.log(kmp('abcabcdabce', 'abcdabce'))
console.log(kmp('aabababc', 'ababc'))