学习笔记

#### String

* Unicode与UTF-8转换

| 码点(十进制) | 字节(二进制) |
|    -    |   -   |
| 0 - 127 | 0xxxxxxx |
| 128 - 2047 | 110xxxxx 10xxxxxx |
| 2048 - 65535 | 1110xxxx 10xxxxxx 10xxxxxx |
| 65536 - 2097151 | 1110xxxx 10xxxxxx 10xxxxxx |

```
  步骤：
    1. 获取字符的unicode码点
    2. 判断码点处于哪个范围
    3. 将码点转为二进制，从左往右进行字节填充
```

#### 对象的基础知识
* 对象三要素：identifier、state、behavior
* 在设计对象的行为和状态时，我们总是遵循 “行为改变状态” 的原则

