'use strict';
const api = require('./common/api');

module.exports = async (activity) => {

  try {
    var data = {};

    // extract _action from Request
    var _action = getObjPath(activity.Request, "Data.model._action");
    if (_action) {
      activity.Request.Data.model._action = {};
    } else {
      _action = {};
    }

    switch (activity.Request.Path) {

      case "create":
      case "submit":
        const form = _action.form;
        var response = await api.post('/helpdesk/tickets.json', {
          json: true,
          body: {
            helpdesk_ticket: {
              subject: form.subject,
              description: form.description,
              email: activity.Context.UserEmail,
            }
          }
        });

        var comment = "Task created";
        data = getObjPath(activity.Request, "Data.model");
        data._action = {
          response: {
            success: true,
            message: comment
          }
        };
        break;

      default:
        // initialize form subject with query parameter (if provided)
        if (activity.Request.Query && activity.Request.Query.query) {
          data = {
            form: {
              subject: activity.Request.Query.query
            }
          };
        }
        break;
    }

    // copy response data
    activity.Response.Data = data;
  } catch (error) {
    // handle generic exception
    Activity.handleError(error);
  }

  function getObjPath(obj, path) {

    if (!path) return obj;
    if (!obj) return null;

    var paths = path.split('.'),
      current = obj;

    for (var i = 0; i < paths.length; ++i) {
      if (current[paths[i]] == undefined) {
        return undefined;
      } else {
        current = current[paths[i]];
      }
    }
    return current;
  }
};
