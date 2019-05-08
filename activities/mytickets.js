'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    var pagination = $.pagination(activity);

    api.initialize(activity);
    const response = await api(`/helpdesk/tickets.json?page=${pagination.page}`);
    if ($.isErrorResponse(activity, response)) return;

    let daterange = $.dateRange(activity, "today");
    let tickets = filterTicketsByDateRange(response, daterange);

    let freshserviceDomain = api.getDomain();
    activity.Response.Data.items = convertResponse(tickets);
    let value = activity.Response.Data.items.items.length;
    activity.Response.Data.title = T(activity, 'Freshservice Tickets');
    activity.Response.Data.link = `https://${freshserviceDomain}/helpdesk/tickets`;
    activity.Response.Data.linkLabel = T(activity, 'All Tickets');
    activity.Response.Data.actionable = value > 0;

    if (value > 0) {
      activity.Response.Data.value = value;
      activity.Response.Data.color = 'blue';
      activity.Response.Data.description = value > 1 ? T(activity, "You have {0} tickets.", value)
        : T(activity, "You have 1 ticket.");
    } else {
      activity.Response.Data.description = T(activity, `You have no tickets.`);
    }
  } catch (error) {
    $.handleError(activity, error);
  }
};
/**maps response data to items */
function convertResponse(tickets) {
  let items = [];
  let freshserviceDomain = api.getDomain();

  for (let i = 0; i < tickets.length; i++) {
    let raw = tickets[i];
    let item = {
      id: raw.id,
      title: raw.subject,
      description: raw.description,
      date: new Date(raw.created_at).toISOString(),
      link: `https://${freshserviceDomain}/helpdesk/tickets/${raw.display_id}`,
      raw: raw
    };
    items.push(item);
  }

  return { items: items };
}
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