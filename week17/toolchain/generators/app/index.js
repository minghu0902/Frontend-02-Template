const Generator = require('yeoman-generator');

module.exports = class extends Generator {
  // The name `constructor` is important here
  constructor(args, opts) {
    // Calling the super constructor is important so our generator is correctly set up
    super(args, opts);
  }

  async initPackage() {
    const answers = await this.prompt([
      {
        type: "input",
        name: "name",
        message: "Your project name",
        default: this.appname // Default to current folder name
      }
    ])

    const pkgJson = {
      "name": answers.name,
      "version": "1.0.0",
      "description": "",
      "main": "src/main.js",
      "scripts": {
        "build": "webpack",
        "test": "mocha test.js --require @babel/register",
        "coverage": "nyc mocha test.js"
      },
      "author": "",
      "license": "ISC"
    }
    
    this.fs.extendJSON(this.destinationPath('package.json'), pkgJson)
    this.npmInstall(['vue'], { 'save-dev': false })
    this.npmInstall(['webpack', 'webpack-cli', 'babel-loader', 'vue-loader', 
      '@babel/register', '@babel/core', '@babel/preset-env',
      'babel-plugin-istanbul', '@istanbuljs/nyc-config-babel', 'mocha', 'nyc',
      'vue-template-compiler', 'css-loader', 'vue-style-loader', 'copy-webpack-plugin'],
      { 'save-dev': true })
  }

  copyFiles() {
    this.fs.copyTpl(
      this.templatePath('index.html'),
      this.destinationPath('public/index.html'),
      { title: this.appname }
    )

    this.fs.copyTpl(
      this.templatePath('HelloWorld.vue'),
      this.destinationPath('src/components/HelloWorld.vue')
    )

    this.fs.copyTpl(
      this.templatePath('webpack.config.js'),
      this.destinationPath('webpack.config.js')
    )

    this.fs.copyTpl(
      this.templatePath('main.js'),
      this.destinationPath('src/main.js')
    )

    this.fs.copyTpl(
      this.templatePath('.babelrc'),
      this.destinationPath('.babelrc')
    )

    this.fs.copyTpl(
      this.templatePath('.nycrc'),
      this.destinationPath('.nycrc')
    )

    this.fs.copyTpl(
      this.templatePath('example-test.js'),
      this.destinationPath('test/example-test.js')
    )
  }
};

  