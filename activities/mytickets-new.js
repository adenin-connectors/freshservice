'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);
    const response = await api('/helpdesk/tickets.json');

    if ($.isErrorResponse(activity, response)) return;

    let daterange = $.dateRange(activity, "today");
    let tickets = filterTicketsByDateRange(response, daterange);

    let freshserviceDomain = api.getDomain();

    let ticketStatus = {
      title: T(activity, 'New Freshservice Tickets'),
      link: `https://${freshserviceDomain}/helpdesk/tickets`,
      linkLabel: T(activity, 'All Tickets'),
    };

    let noOfTickets = tickets.length;

    if (noOfTickets > 0) {
      ticketStatus = {
        ...ticketStatus,
        description: noOfTickets > 1 ? T(activity, "You have {0} new tickets.", noOfTickets) : T(activity, "You have 1 new ticket."),
        color: 'blue',
        value: noOfTickets,
        actionable: true
      };
    } else {
      ticketStatus = {
        ...ticketStatus,
        description: T(activity, `You have no new tickets.`),
        actionable: false
      };
    }

    activity.Response.Data = ticketStatus;
  } catch (error) {
    $.handleError(activity, error);
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