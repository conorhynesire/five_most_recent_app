import View from 'view';
const MAX_HEIGHT = 375;

class Common {
  constructor(client, data) {
    this.client = client;
    this._metadata = data.metadata;
    this._context = data.context;

    this.view = new View({
      afterRender: () => {
        let newHeight = Math.min($('html').height(), MAX_HEIGHT);
        this.client.invoke('resize', {
          height: newHeight,
          width: '100%'
        });
      }
    });

    this.view.switchTo('loading');
  }

  async init() {
    const path = this.path;
    const getData = await this.client.get(path);
    const requestData = await this.client.request({
      url: `/api/v2/users/${getData[path]}/tickets/requested.json?sort_order=desc`,
      dataType: 'json'
    });
    const sortedTickets = this.sortTickets(requestData.tickets);
    this.view.switchTo('main', {
      latestTickets: _.take(
        sortedTickets,
        this._metadata.settings.max_tickets_to_display
      ),
      domain: `https://${this._context.account.subdomain}.zendesk.com`
    });

    const links = document.querySelectorAll('a.link_to_ticket');
    console.log('Found ' + links.length);
    links.forEach(element => {
      console.log('binding to ', element);
      element.addEventListener('click', event => {
        event.preventDefault();
        this.client.invoke('routeTo', 'ticket', event.target.getAttribute('ticket_id'));
      });
    });
  }

  sortTickets(tickets = []) {
    return _.chain(tickets)
      .sortBy('id')
      .value()
      .reverse();
  }
}

export default Common;
