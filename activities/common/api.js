'use strict';
const got = require('got');
const isPlainObj = require('is-plain-obj');
const HttpAgent = require('agentkeepalive');
const HttpsAgent = HttpAgent.HttpsAgent;

let _activity = null;

function api(path, opts) {
  if (typeof path !== 'string') {
    return Promise.reject(new TypeError(`Expected \`path\` to be a string, got ${typeof path}`));
  }

  let freshserviceDomain = getDomain();

  opts = Object.assign({
    json: true,
    endpoint: `https://${freshserviceDomain}/`,
    token: _activity.Context.connector.custom2,
    agent: {
      http: new HttpAgent(),
      https: new HttpsAgent()
    }
  }, opts);

  opts.headers = Object.assign({
    accept: 'application/json',
    'user-agent': 'adenin Now Assistant Connector, https://www.adenin.com/now-assistant'
  }, opts.headers);

  if (opts.token) {
    opts.headers.Authorization = `Basic ` + Buffer.from(opts.token + ":xxxxx").toString("base64");
  }

  const url = /^http(s)\:\/\/?/.test(path) && opts.endpoint ? path : opts.endpoint + path;

  if (opts.stream) {
    return got.stream(url, opts);
  }

  return got(url, opts).catch(err => {
    throw err;
  });
}
const helpers = [
  'get',
  'post',
  'put',
  'patch',
  'head',
  'delete'
];

api.stream = (url, opts) => apigot(url, Object.assign({}, opts, {
  json: false,
  stream: true
}));

api.initialize = function (activity) {
  _activity = activity;
};

function getDomain() {
  let domain = _activity.Context.connector.custom1;
  domain = domain.replace('https://', '');
  domain = domain.replace('/', '');

  if (!domain.includes('.freshservice.com')) {
    domain += '.freshservice.com';
  }
  return domain;
};

for (const x of helpers) {
  const method = x.toUpperCase();
  api[x] = (url, opts) => api(url, Object.assign({}, opts, { method }));
  api.stream[x] = (url, opts) => api.stream(url, Object.assign({}, opts, { method }));
}
//**returns status object based on provided tickets */
api.getTicketStatus = function (tickets) {
  let freshserviceDomain = getDomain();

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

  return ticketStatus;
};

module.exports = api;
