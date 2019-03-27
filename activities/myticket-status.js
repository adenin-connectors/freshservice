'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    const response = await api('/helpdesk/tickets.json');

    if (Activity.isErrorResponse(response)) return;

    let freshserviceDomain = api.getDomain();

    let ticketStatus = {
      title: T('Freshservice Tickets'),
      link: `https://${freshserviceDomain}/helpdesk/tickets`,
      linkLabel: T('All Tickets'),
    };

    let noOfTickets = response.body.length;

    if (noOfTickets > 0) {
      ticketStatus = {
        ...ticketStatus,
        description: noOfTickets > 1 ? T("You have {0} tickets.", noOfTickets) : T("You have 1 ticket."),
        color: 'blue',
        value: noOfTickets,
        actionable: true
      };
    } else {
      ticketStatus = {
        ...ticketStatus,
        description: T(`You have no tickets.`),
        actionable: false
      };
    }

    activity.Response.Data = ticketStatus;
  } catch (error) {
    Activity.handleError(error);
  }
};