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

    let tickets = response.body;
    let freshserviceDomain = api.getDomain();

    let ticketStatus = {
      title: 'Freshdesk Tickets',
      url: `https://${freshserviceDomain}/helpdesk/tickets`,
      urlLabel: 'All Tickets',
    };

    let noOfTickets = tickets.length;

    if (noOfTickets > 0) {
      ticketStatus = {
        ...ticketStatus,
        description: `You have ${noOfTickets > 1 ? noOfTickets + " tickets" : noOfTickets + " ticket"}`,
        color: 'blue',
        value: noOfTickets,
        actionable: true
      };
    } else {
      ticketStatus = {
        ...ticketStatus,
        description: `You have no tickets.`,
        actionable: false
      };
    }

    activity.Response.Data = ticketStatus;
  } catch (error) {
    cfActivity.handleError(activity, error);
  }
};