'use strict';

var EventEmitter = require('events').EventEmitter,
    assign = require('react/lib/Object.assign'),
    shallowEqual = require('react/lib/shallowEqual'),
    bindAll = require('./bindAll'),
    CHANGE_EVENT = 'change';

function createStore(spec) {
  var store = assign({
    emitChange:function() {
      this.emit(CHANGE_EVENT);
    },

    addChangeListener:function(callback) {
      this.on(CHANGE_EVENT, callback);
    },

    removeChangeListener:function(callback) {
      this.removeListener(CHANGE_EVENT, callback);
    }
  }, spec, EventEmitter.prototype);

  store.setMaxListeners(0);
  bindAll(store);

  return store;
}

module.exports = createStore;