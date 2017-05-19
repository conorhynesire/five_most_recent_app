import Common from './common';

class TalkPopover extends Common {
  constructor(client, data) {
    super(client, data);
    this.path = 'call.callerId.id';

    this.client.on('call.callState.changed', callState => {
      if (callState === 'offered') {
        this.init();
      } else if (callState === 'nothing') {
        this.view.switchTo('loading');
      }
    });
  }
}

export default TalkPopover;
