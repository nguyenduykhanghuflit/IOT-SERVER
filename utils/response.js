module.exports = ok = (data, code = 0, message = 'success') => {
  return {
    code,
    message,
    data,
  };
};
