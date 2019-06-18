'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);
    let allTickets = [];
    let page = 1;
    let maxResults = 30;

    let userMail = activity.Context.UserEmail;
    let currentUser = await api(`/agents.json?query=email is ${userMail}`);
    if ($.isErrorResponse(activity, currentUser)) return;
    if (currentUser.body.length == 0) {
      // current user not found on freshservice we return
      return;
    }
    let myId = currentUser.body[0].agent.user_id;
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

    let tickets = filterMyTickets(allTickets, myId);

    let daterange = $.dateRange(activity, "today");
    tickets = api.filterTicketsByDateRange(tickets, daterange);

    let value = tickets.length;
    let pagination = $.pagination(activity);
    tickets = api.paginateItems(tickets, pagination);

    let freshserviceDomain = api.getDomain();
    activity.Response.Data.items = api.convertResponse(tickets);
    activity.Response.Data.title = T(activity, 'Open Tickets');
    activity.Response.Data.link = `https://${freshserviceDomain}/helpdesk/tickets`;
    activity.Response.Data.linkLabel = T(activity, 'All Tickets');
    activity.Response.Data.actionable = value > 0;

    if (value > 0) {
      activity.Response.Data.value = value;

      // items are alrady sorted by date descending (higest value first) in api request
      // request wasn't changed it's just tested to see how it is sorted
      // there is no option to change default sort order
      activity.Response.Data.date = activity.Response.Data.items[0].date;
      activity.Response.Data.color = 'blue';
      activity.Response.Data.description = value > 1 ? T(activity, "You have {0} open tickets.", value)
        : T(activity, "You have 1 open ticket.");
    } else {
      activity.Response.Data.description = T(activity, `You have no open tickets.`);
    }
  } catch (error) {
    $.handleError(activity, error);
  }
};

//** filters tickets by provided freshservice user id */
function filterMyTickets(tickets, myId) {
  let myTickets = []
  for (let i = 0; i < tickets.length; i++) {
    if (tickets[i].responder_id == myId) {
      myTickets.push(tickets[i]);
    }
  }

  return myTickets;
}