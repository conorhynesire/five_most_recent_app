import View from 'view';

const MAX_HEIGHT = 375;

class TicketSidebar {
  constructor(client, data) {
    this.client = client;
    this._metadata = data.metadata;

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
    
    this.init();
  }

  async init() {
    const getData = await this.client.get('ticket.requester.id');
    const requestData = await this.client.request({
      url: `/api/v2/users/${getData['ticket.requester.id']}/tickets/requested.json?sort_order=desc`,
      dataType: 'json'
    });
    const sortedTickets = this.sortTickets(
      requestData.tickets,
      this._metadata.settings.max_tickets_to_display
    );
    this.view.switchTo('main', {
      latestTickets: sortedTickets
    });
  }

  sortTickets(tickets = [], maxTickets = 5) {
    return _.chain(tickets)
      .sortBy('id')
      .take(maxTickets)
      .value();
  }
}

export default TicketSidebar;
