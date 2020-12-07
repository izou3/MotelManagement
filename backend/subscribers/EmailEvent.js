const EventEmitter = require('events');

/**
 * Send Reservation Confirmation Email Events
 * by adding email jobs onto the queue
 */
class EmailEvents extends EventEmitter {
  constructor(messageQueue) {
    super();
    this._jobName = 'ReservationConfirmation';
    this._errorName = 'error';
    this._messageQueue = messageQueue || null;
  }

  set setMessageQueue(messageQueue) {
    this._messageQueue = messageQueue;
  }

  get getJobName() {
    return this._jobName;
  }

  get getErrorName() {
    return this._errorName;
  }

  /**
   * Push New Job into Queue with Data
   * @param {Object} data
   */
  addToQueue(data) {
    this._messageQueue.now(this._jobName, data);
  }
}

module.exports = new EmailEvents();
