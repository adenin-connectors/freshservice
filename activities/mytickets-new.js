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
    let daterange = cfActivity.dateRange(activity, "today");
    let tickets = filterTicketsByDateRange(response, daterange);

    activity.Response.Data = api.getTicketStatus(tickets);
  } catch (error) {
    cfActivity.handleError(activity, error);
  }
};
//** filters Tickets based on privided daterange */
function filterTicketsByDateRange(response, daterange) {
  let filtered = [];
  let tickets = response.body;
  let start = new Date(daterange.startDate).valueOf();
  let end = new Date(daterange.endDate).valueOf();

  for (let i = 0; i < tickets.length; i++) {
    //converts time to proper miliseconds
    let milis = new Date(tickets[i].created_at).valueOf();
    if (milis > start && milis < end) {
      filtered.push(tickets[i]);
    }
  }

  return filtered;
}