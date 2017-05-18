import TicketSidebar from '../../src/javascripts/ticket_sidebar';

describe('TicketSidebar', () => {
  let client, app, tickets;

  beforeEach(() => {
    client = jasmine.createSpyObj('client', [
      'get',
      'set',
      'invoke',
      'request'
    ]);
  });

  async function sleep(ms = 20) {
    await setTimeout(() => { /* no-op */ }, ms);
  }

  function createTickets(ticketsToCreate = 10) {
    const tickets = _.chain(_.range(ticketsToCreate))
      .map(id => ({ id, subject: `Ticket ${id}` }))
      .value();
    return {
      tickets
    };
  }

  function createSubject(maxTickets = 5) {
    return new TicketSidebar(client, {
      metadata: {
        settings: {
          max_tickets_to_display: maxTickets
        }
      },
      context: {}
    });
  }

  describe('#init', () => {
    beforeEach(() => {
      client.get.and.returnValue(Promise.resolve({
        'ticket.requester.id': 2
      }));
      tickets = createTickets();
      client.request.and.returnValue(Promise.resolve(tickets));
      app = createSubject();
      spyOn(app.view, 'switchTo');
    });

    it('gets the requester id', async done => {
      await sleep();
      expect(client.get).toHaveBeenCalledWith('ticket.requester.id');
      done();
    });

    it('loads tickets based on requester id', async done => {
      await sleep();
      expect(client.request).toHaveBeenCalledWith({
        url: `/api/v2/users/2/tickets/requested.json?sort_order=desc`,
        dataType: 'json'
      });
      done();
    });

    it('renders the correct number of tickets', async done => {
      app = createSubject(2);
      spyOn(app.view, 'switchTo');
      await sleep();
      expect(app.view.switchTo).toHaveBeenCalledWith('main', {
        latestTickets: _.chain(tickets.tickets)
          .sortBy('id')
          .value()
          .reverse()
          .slice(0, 2)
      });
      done();
    });
  });

  describe('#sortTickets', () => {
    beforeEach(() => {
      tickets = createTickets(3);
      app = createSubject();
      spyOn(app, 'init');
    });

    it('should sort the tickets by id descending', () => {
      const randomOrderTickets = tickets.tickets.slice();
      _.shuffle(randomOrderTickets);
      expect(app.sortTickets(randomOrderTickets)[0]).toEqual({
        id: 2,
        subject: 'Ticket 2'
      });
    });

    it('should return an empty array when input is null', () => {
      expect(app.sortTickets()).toEqual([]);
    });
  })
});
