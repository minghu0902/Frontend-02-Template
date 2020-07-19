学习笔记

#### 表达式(Experission)
  * PrimaryExpression
    表达式中的最小单元，涉及的语法结构优先级最高
    包含了各种直接量
  ```js
    'abc'
    123
    true
    false
    undefined
    null
    ({})
    (function () {})
    []
    /\d/g

    // 任何表达式加上()都被认为是 PrimaryExpression，从而可以改变运算符的运算顺序
    (a + b) * c
  ```

  * MemberExpression
    用来访问对象成员
  ```js
    a.b
    a['b']
    new.target // 用在构造函数中，用来检测一个函数是否是被作为构造函数通过 new 调用的 
    super.b // 用在 class 中访问父类的属性和方法
  ```

  * NewExpression
    加上 new 运算符的表达式
  ```js
    // 分为带括号和不带括号，带括号的优先级更高
    new Number
    new Number()
  ```
  * CallExpression
    函数调用表达式
  ```js
    fn()
    super()

    // 由 MemberExpression 构成的 CallExpression
    // MemberExpression 中的某一子结构具有函数调用，那么整个表达式就成为了一个 CallExpression
    a.b()
    a.b().c
  ```

  * LeftHandSideExpression
    左值表达式，直观的讲，左值表达式就是可以放在等号左边的表达式。
    NewExpression 和 CallExpression 统称 LeftHandSideExpression。
  ```js
    a.b().c = 1
  ```

  * AssignmentExpression
    赋值表达式
  ```js
    a = b
    a = b = c = d
    // 连续赋值是右结合的，等同于
    a = (b = (c = d))

    // 结合一些运算符
    a += b // 等同于 a = a + b
    a *= b // 等同于 a = a * b
  ```

  * ConditionalExpression
  条件表达式，可以放在等号右边的表达式。
  左值表达式同时也是条件表达式。

  * UpdateExpression
    更新表达式
  ```js
    ++a
    --a
    a++
    a--
  ```

  * ExponentiationExpression
  乘方表达式，使用 ** 运算符
  ```js
    2 ** 3
    -2 ** 3 // 这里会报错，-2属于一元运算表达式，不能和放入乘法表达式
    -(2 ** 3) // 加上括号即可

    2 ** 3 ** 4
    // ** 运算是右结合的，等同于
    2 ** (3 ** 4)
  ```

* MultiplicativeExpression
乘法表达式，包括 * / % 3种运算符，优先级一致

```js
  2 * 3 / 2 % 2
```

* AdditiveExpression
加法表达式，由乘法表达式和 + - 运算构成

```js
  2 * 3 + 2
```

* ShiftExpression
  移位表达式，由加法表达式构成，移位是一种位运算，有3种
```js
  >> 
  <<
  >>>
```

* RelationalExpression
关系表达式

```js
  >=
  <=
  <
  >
  instanceof
  in
```

* EqualityExpression
相等表达式
```js
  ==
  !=
  ===
  !==

 // == 运算有3条规则：
 // null == undefined
 
// 字符串和boolean转为数字在比较
 '123' == 123 // true
 true == 1
 false == 0

// 对象转成 primitive 类型在比较，(不包含对象与对象之间比较，两者比较的是内存地址)
 var a = {}
 a[Symbol.toPrimitive] = () => 1
 a == 1 // true
```

* 位运算表达式 
* 逻辑与表达式和逻辑或表达式
```js
  &&
  ||

  // 逻辑表达式具有短路的特性
  true || fn() // true
  false && fn() // false
```

#### 运算符的优先级
  [参考自MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Operator_Precedence)

#### 类型转换
* Number
```js
  // 转 Boolean
  Boolean(0) // false
  Boolean(1) // true
  Boolean(NaN) // false
```
* String
```js
  // 转 Boolean
  Boolean('') // false
  Boolean('a') // true
```
* Boolean
```js
  // 转 String
  String(true) // "true"
  String(false) // "false"

  // 转 Number
  Number(true) // 1
  Number(false) // 0
```
* undefined
```js
  // 转 String
  String(undefined) // "undefined"

  // 转 Number
  Number(undefined) // NaN
```
* null
```js
  // 转 String
  String(null) // "null"

  // 转 Number
  Number(null) // 0
```

* Object
```js
  // 转 Number，会调用 valueOf 方法
  var a = {}
  a.valueOf = function () {
    return 1
  }
  Number(a) // 1

  // 转 String，会调用 toString 方法
  var b = {}
  b.toString = function () {
    return '123'
  }
  String(b) // "123"

  // 转 Boolean
  Boolean({}) // true

```
* Unboxing
把 Object 类型转成 基本类型
```js
  var a = {}
  a.valueOf = function () {
    console.log('valueOf')
    return 1
  }
  a.toString = function () {
    console.log('toString')
    return 2
  }
  a[Symbol.toPrimitive] = function () {
    console.log('primitive')
    return 3
  }

  // 当定义了 Symbol.toPrimitive 属性时，会忽略 valueOf 和 toString 方法
  String(a) // primitive 3
  Number(a) // primitive 3
```

* Boxing
把基础类型转为 Object 类型
```js
  // String
  new String('123') // String{123}
  new Object('123') // String{123}
  Object('123') // String{123}
  
  // Number
  new Number(123) // Number{123}
  new Object(123) // Number{123}
  Object(123) // Number{123}

  // Symbol , 只能使用 Object 进行 Boxing
  new Object(Symbol('1')) // Symbol{Symbol(1)}
  Object(Symbol('1')) // Symbol{Symbol(1)}

  // 当使用 . 运算符调用基础类型的方法的时候，默认会自动进行 Boxing
  (1).toString()

```
