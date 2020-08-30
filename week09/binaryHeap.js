class BinaryHeap {
  constructor(data, compare) {
    this.data = data
    this.compare = compare || ((a, b) => a - b)
  }
  take() {
    if (!this.data.length) {
      return
    }
    let min = this.data[0]
    this._remove(0)
    return min
  }
  _remove(i) {
    // 比较当前节点下的左右子节点，并替换掉当前节点
    while(i < this.data.length) {
      const leftChildIndex = 2 * i + 1
      const rightChildIndex = 2 * i + 2
      if (leftChildIndex >= this.data.length) {
        break
      }
      if (rightChildIndex >= this.data.length) {
        this.data[i] = this.data[leftChildIndex]
        i = leftChildIndex
        break
      }
      if (this.compare(this.data[leftChildIndex], this.data[rightChildIndex]) < 0) {
        this.data[i] = this.data[leftChildIndex]
        i = leftChildIndex
      } else {
        this.data[i] = this.data[rightChildIndex]
        i = rightChildIndex
      }
    }
    // 处理当前是最后一层的左子节点的情况
    if (i < this.data.length) {
      this._insertAt(i, this.data.pop())
    } else {
      this.data.pop()
    }
  }
  _insertAt(i, v) {
    this.data[i] = v
    while(i > 0) {
      const parentIndex = Math.floor(Math.floor((1 - 1) / 2))
      // 比较当前节点与父节点，如果当前节点比父节点小，则交换位置
      if (this.compare(v, this.data[parentIndex]) < 0) {
        this.data[i] = this.data[parentIndex]
        this.data[parentIndex] = v
        i = parentIndex
      } else {
        break
      }
    }
  }
  _insert(v) {
    this._insertAt(this.data.length, v)
  }
  give(v) {
    this._insert(v)
  }
  get length() {
    return this.data.length
  }
}