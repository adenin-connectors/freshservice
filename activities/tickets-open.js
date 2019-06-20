'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);
    let allTickets = [];
    let page = 1;
    let maxResults = 30;

    // page size for freshservice is 30 and can't be changed with request url parameter
    let response = await api(`/helpdesk/tickets.json?page=${page}`);
    if ($.isErrorResponse(activity, response)) return;
    allTickets.push(...response.body);
    let hasMore = false;
    if (response.body.length == maxResults) {
      hasMore = true;
    }

    while (hasMore) {
      page++;
      response = await api(`/helpdesk/tickets.json?page=${page}`);
      if ($.isErrorResponse(activity, response)) return;
      allTickets.push(...response.body);
      if (response.body.length != maxResults) {
        hasMore = false;
      }
    }

    let daterange = $.dateRange(activity, "today");
    let tickets = api.filterTicketsByDateRange(allTickets, daterange);

    let value = tickets.length;
    let pagination = $.pagination(activity);
    tickets = api.paginateItems(tickets, pagination);

    let freshserviceDomain = api.getDomain();
    activity.Response.Data.items = api.convertResponse(tickets);
    if (parseInt(pagination.page) == 1) {
      activity.Response.Data.title = T(activity, 'Open Tickets');
      activity.Response.Data.link = `https://${freshserviceDomain}/helpdesk/tickets`;
      activity.Response.Data.linkLabel = T(activity, 'All Tickets');
      activity.Response.Data.actionable = value > 0;

      if (value > 0) {
        activity.Response.Data.value = value;

        // items are alrady sorted by date descending (higest value first) in api request
        // request wasn't changed it's just tested to see how it is sorted
        // there is no option to change default sort order
        activity.Response.Data.date = allTickets[0].created_at;
        activity.Response.Data.color = 'blue';
        activity.Response.Data.description = value > 1 ? T(activity, "You have {0} open tickets.", value)
          : T(activity, "You have 1 open ticket.");
      } else {
        activity.Response.Data.description = T(activity, `You have no open tickets.`);
      }
    }
  } catch (error) {
    $.handleError(activity, error);
  }
};