
Handlebars.registerHelper ('truncate', function (str, len) {
  if (str.length > len && str.length > 0) {
      var new_str = str + " ";
      new_str = str.substr (0, len);
      new_str = str.substr (0, new_str.lastIndexOf(" "));
      new_str = (new_str.length > 0) ? new_str : str.substr (0, len);
      return new Handlebars.SafeString ( new_str +'...' );
  }
  return str;
});
Handlebars.registerHelper('t', function(key) {
    try {
      return context[''+key+''];
    } catch(e) {
      console.error(e);
      return e.message;
    }
  });

function flatten(object) {
  var flattened = {};
  Object.keys(object).forEach(function(key) {
    if (object[key] && typeof object[key] === 'object') {
      var flatObject = flatten(object[key]);
      Object.keys(flatObject).forEach(function(key2) {
        flattened[[key, key2].join('.')] = flatObject[key2];
      });
    } else {
      flattened[key] = object[key];
    }
  });
  return flattened;
}
  $.handlebars({
      templatePath: './templates',
      templateExtension: 'hbs'
  });
  function tryRequire(locale) {
    try {
      $.getJSON('translations/'+locale+'.json').always(function(data) {
        context = flatten(data);
      });
    } catch(e) {
      console.log(e);
      return null;
    }
  }
  var locale, fetchTicketForms, fetchTicketFields, context;
  var client = ZAFClient.init();
  $(window).resize(function () {
    client.invoke('resize', { width: '100%', height: $(document).height()});
  })
  Promise.all([client.get('currentAccount'),
    client.get('ticket'),
    client.get('currentUser')]).then(
      function fullfilled(contents) {
        var mixedData = {
          "reqester_id": contents[1].ticket.requester.id,
          "agent_id": contents[2].currentUser.id,
          "subdomain": contents[0].currentAccount.subdomain
        }
      lastFiveTickets(mixedData);
      tryRequire(contents[2].currentUser.locale);
    });

  var lastFiveTickets = function(x) {
    fetchFiveTickets = {
      url: '/api/v2/users/'+ x.reqester_id +'/tickets/requested.json?sort_order=desc',
      type: 'GET',
      dataType: 'json'
    };
    client.request(fetchFiveTickets).then(function(data){
      handleUserResults(x,data);
    })
  }
  var handleUserResults= function(x,data) {
        var lastestFive = _.take(data.tickets, 5).sort(function(a,b) {
          var aID = a.id;
          var bID = b.id;
          return (aID === bID) ? 0 : (aID < bID) ? 1 : -1;
        });
        _.each(lastestFive, function(y) {
          y.subdomain = x.subdomain;
          y.agent_id = x.agent_id;
        })
        console.log('las', lastestFive);
        $('#ticket-links').render('ticket',{
          lastFive: lastestFive
        });
  }

  var openSaysme = function(href){
    console.log('open', href);
    voiceHack = {
      url: href,
      type: 'POST',
      dataType: 'json'
    }
    client.request(voiceHack);
  }

$(document).bind('DOMNodeInserted', function(e) {
  $('#ticket-links a').on('click', function(e){
    e.preventDefault();
    openSaysme(e.currentTarget.href)
  });
    client.invoke('resize', { width: '100%', height: $(document).height()});
});
