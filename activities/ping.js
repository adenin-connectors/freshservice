'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);
    const response = await api('/agents.json');

    if ($.isErrorResponse(activity, response)) return;

    activity.Response.Data = {
      success: response && response.statusCode === 200 && !response.body.require_login
    };
  } catch (error) {
    $.handleError(activity, error);
    activity.Response.Data.success = false;
  }
};
