'use strict';

const logger = require('@adenin/cf-logger');

module.exports = {
  handleError(error, activity) {
    logger.error(error);

    let m = error.message;

    if (error.stack) {
      m = m + ': ' + error.stack;
    }

    activity.Response.ErrorCode = (error.response && error.response.statusCode) || 500;

    activity.Response.Data = {
      ErrorText: m
    };
  }
};
