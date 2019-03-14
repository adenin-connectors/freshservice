'use strict';

const logger = require('@adenin/cf-logger');
const cfActivity = require('@adenin/cf-activity');
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);

    var pagination = cfActivity.pagination(activity);

    const response = await api(`/helpdesk/tickets.json?page=${pagination.page}`);

    if (!cfActivity.isResponseOk(activity, response)) {
      return;
    }

    activity.Response.Data = convertResponse(response);
  } catch (error) {
    cfActivity.handleError(error, activity);
  }
};
/**maps response data to items */
function convertResponse(response) {
  let items = [];
  let tickets = response.body;

  let freshserviceDomain = api.getDomain();

  for (let i = 0; i < tickets.length; i++) {
    let raw = tickets[i];
    let item = {
      id: raw.id,
      title: raw.subject,
      description: raw.description,
      link: `https://${freshserviceDomain}/helpdesk/tickets/${raw.display_id}`,
      raw: raw
    };
    items.push(item);
  }

  return { items: items };
}