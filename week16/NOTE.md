学习笔记

本周主要学习了yeoman的使用，并使用yeoman搭建了一个基础版的脚手架

### yeoman
yeoman是一个通用的脚手架生成工具

##### 创建项目
  * 初始化
    1. npm init (package.json文件中，name属性必须以 generator- 作为前缀)
    2. npm install --save yeoman-generator
    3. 创建文件目录 (生成器的文件必须放在 generators 目录下，否则需要在 package.json 文件中的 files 属性中指定)

##### GENERATOR RUNTIME CONTEXT
  * 每次调用生成器时，都会运行添加到原型中的每个方法——而且通常是按顺序运行的
  * 辅助方法和私有方法不会自动运行，主要包括以下3中
    1. 以下划线开头的方法
    ```js
    class extends Generator {
      method1() {
        console.log('hey 1');
      }

      _private_method() {
        console.log('private hey');
      }
    }
    ```
    2. 构造函数内部定义的方法
    ```js
    class extends Generator {
      constructor(args, opts) {
        // Calling the super constructor is important so our generator is correctly set up
        super(args, opts)

        this.helperMethod = function () {
          console.log('won\'t be called automatically');
        };
      }
    }
    ```
    3. 继承自父类
    ```js
    class MyBase extends Generator {
      helper() {
        console.log('methods on the parent generator won\'t be called automatically');
      }
    }

    module.exports = class extends MyBase {
      exec() {
        this.helper();
      }
    };
    ```