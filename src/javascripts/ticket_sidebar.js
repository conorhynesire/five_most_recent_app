import Common from './common';

class TicketSidebar extends Common {
  constructor(client, data) {
    super(client, data);
    this.path = 'ticket.requester.id';
    this.init();
  }
}

export default TicketSidebar;
