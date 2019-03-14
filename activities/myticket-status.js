'use strict';

const cfActivity = require('@adenin/cf-activity');
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);

    const response = await api('/helpdesk/tickets.json');

    if (!cfActivity.isResponseOk(activity, response)) {
      return;
    }

    activity.Response.Data = api.getTicketStatus(response.body);
  } catch (error) {
    cfActivity.handleError(activity, error);
  }
};