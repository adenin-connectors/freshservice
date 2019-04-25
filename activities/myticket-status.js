'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);
    const response = await api('/helpdesk/tickets.json');

    if ($.isErrorResponse(activity, response)) return;

    let freshserviceDomain = api.getDomain();

    let ticketStatus = {
      title: T(activity, 'Freshservice Tickets'),
      link: `https://${freshserviceDomain}/helpdesk/tickets`,
      linkLabel: T(activity, 'All Tickets'),
    };

    let noOfTickets = response.body.length;

    if (noOfTickets > 0) {
      ticketStatus = {
        ...ticketStatus,
        description: noOfTickets > 1 ? T(activity, "You have {0} tickets.", noOfTickets) : T(activity, "You have 1 ticket."),
        color: 'blue',
        value: noOfTickets,
        actionable: true
      };
    } else {
      ticketStatus = {
        ...ticketStatus,
        description: T(activity, `You have no tickets.`),
        actionable: false
      };
    }

    activity.Response.Data = ticketStatus;
  } catch (error) {
    $.handleError(activity, error);
  }
};