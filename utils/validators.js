// utils/validators.js
function isValidEmail(e) {
    return /\S+@\S+\.\S+/.test(e);
  }
  module.exports = { isValidEmail };
  