var generator = require('generate-password');

module.exports={
  promiseMe: async function (promise) {
    try {
      const data = await promise
      return [data,null]
    } catch (e) {
      console.error(e)
      return [null, { e, success: false, msg: "Promise Failed" }]
    }
  },
  generateToken: function (inputs) {
    const defaultInput = {
      length: 6,
      numbers: false,
      lowercase:true,
      uppercase:true
    }
    const input = {
      ...defaultInput,
      ...inputs
    }
    return generator.generate(input);
  }
}