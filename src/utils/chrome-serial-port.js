/* global chrome */

import { EventEmitter } from 'events';
import * as util from 'util';

/* eslint-disable */

var SerialPort = function (path, options, openImmediately, callback) {

  EventEmitter.call(this);

  var self = this;
  self.port = {};

  var args = Array.prototype.slice.call(arguments);
  callback = args.pop();
  if (typeof(callback) !== 'function') {
    callback = null;
  }

  this.options = (typeof options !== 'function') && options || {};

  openImmediately = (openImmediately === undefined || openImmediately === null) ? true : openImmediately;

  callback = callback || function (err) {
    if (err) {
      if (self._events.error) {
        self.emit('error', err);
      } else {
        //factory doesnt exist atm
        // factory.emit('error', err);
      }
    }
  };

  chrome.runtime.sendMessage(SerialPort.extensionId, {op: 'construct', path: path, options: this.options},
    function(response) {
      if(chrome.runtime.lastError){
        return callback(chrome.runtime.lastError);
      }

      if(response && response.error){
        return callback(new Error(response.error));
      }

      if (openImmediately) {
        process.nextTick(function () {
          self.open(callback);
        });
      }
    });

};
util.inherits(SerialPort, EventEmitter);

//always open immediately
SerialPort.prototype.open = function (callback) {
  if(!callback) { callback = function () {}; }

  var self = this;

  chrome.runtime.sendMessage(SerialPort.extensionId, {op: 'open'},
    function(response) {
      if(chrome.runtime.lastError){
        return callback(chrome.runtime.lastError);
      }

      if(response && response.error){
        return callback(new Error(response.error));
      }

      self.port = chrome.runtime.connect(SerialPort.extensionId);
      if(chrome.runtime.lastError)
      {
        //any other cleanup?
        return callback(chrome.runtime.lastError);
      }

      self.port.onDisconnect.addListener(function(){
        self.port = null;
      });

      var handleMessage = function (msg) {

        console.log(msg, 'received');

        var cmds = {
          onDisconnect:function (){
            self.port.disconnect();
            //no way to know chrome port is disconnected?
            //can't just next tick so null here instead of waiting for ondisconnect
            self.port = null;
            self.emit('disconnect', msg.error);
          },
          onError:function (){
            self.emit('error', msg.error);
          },
          onClose:function (){
            self.port.disconnect();
            //no way to know chrome port is disconnected?
            //can't just next tick so null here instead of waiting for ondisconnect
            self.port = null;
            self.emit('close');
          },
          data:function (){
            if(msg && msg.hasOwnProperty('data') && msg.data.hasOwnProperty('data')){
              self.emit('data', new Buffer(msg.data.data));
            }
          }
        };

        if (!cmds.hasOwnProperty(msg.op)) {
          console.log('unknown op');
        }

        cmds[msg.op]();
      };

      self.port.onMessage.addListener(handleMessage);
      self.emit('open');
      callback();
    });
};

SerialPort.prototype.write = function (data, callback) {
  if(!callback) { callback = function () {}; }

  //check if port is open somehow or chrome will just die
  if(!this.port) { return callback(new Error('Serialport not open')); }

  //node-serialport accepts strings or buffers
  //force a buffer so we know what we're dealing with on the other side
  //todo check for buffer and or error on other unknown types?
  if(typeof data === 'string')
  {
    this.port.postMessage(new Buffer(data));
  }else{
    this.port.postMessage(data);
  }


  callback(chrome.runtime.lastError);
};

SerialPort.prototype.flush = function (callback) {
  if(!callback) { callback = function () {}; }

  chrome.runtime.sendMessage(SerialPort.extensionId, {op: 'flush'},
    function(response) {
      if(chrome.runtime.lastError){
        return callback(chrome.runtime.lastError);
      }

      if(response && response.error){
        return callback(new Error(response.error));
      }

      callback(null, response.data);
    });
};

SerialPort.prototype.drain = function (callback) {
  if(!callback) { callback = function () {}; }

  chrome.runtime.sendMessage(SerialPort.extensionId, {op: 'drain'},
    function(response) {
      if(chrome.runtime.lastError){
        return callback(chrome.runtime.lastError);
      }

      if(response && response.error){
        return callback(new Error(response.error));
      }

      callback(null, response.data);
    });
};

SerialPort.prototype.close = function () {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(SerialPort.extensionId, { op: 'close' },
      (response) => {
        if(chrome.runtime.lastError){
          return reject(chrome.runtime.lastError);
        }

        if(response && response.error){
          reject(new Error(response.error));
        }

        resolve(response);
      });
  })
};

SerialPort.listSerialPorts = function() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(SerialPort.extensionId, { op: 'list', message: 'list' },
    function(response) {
      if(chrome.runtime.lastError){
        return reject(chrome.runtime.lastError);
      }

      if(response && response.error){
        return reject(new Error(response.error));
      }

      resolve(response.data);
    });
  });

};

SerialPort.isInstalled = function (extensionId)
{
  SerialPort.extensionId = extensionId;
  return new Promise((resolve, reject) => {
    if(typeof chrome.runtime === 'undefined') {
      return reject(new Error('chrome-serialport not installed'));
    }

    getManifest(function(err, data) {
      if(err)
        return reject(err);
      else
        return resolve(data);
    });
  });
}

/*
input none
callback callback
*/
function getManifest(callback)
{
  chrome.runtime.sendMessage(SerialPort.extensionId, { op: 'getManifest', 'message': '' },
    function(response) {
      if(chrome.runtime.lastError){
        return callback(chrome.runtime.lastError);
      }

      if(response && response.error){
        return callback(new Error(response.error));
      }

      callback(null, response.data);
    });
}

module.exports = {
  SerialPort
};

/* eslint-enable */
