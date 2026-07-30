const { AsyncLocalStorage } = require('async_hooks');

const requestContext = new AsyncLocalStorage();

module.exports = {
  requestContext,
  withContext: (context, next) => {
    return requestContext.run(context, next);
  },
  getContext: () => {
    return requestContext.getStore() || {};
  }
};
