define(['Util'], function(Util) {

    function CCServer() {

        // function async(fn) {
        //     setTimeout(function() {
        //         fn();
        //     }, 0);
        // }

        var self = this;
        self.peerId = self._uuid();

        var url = document.URL.split('/')[2];
        url = url.split(':')[0];
        self.ws = new WebSocket('ws://' + url + ':1123');

        self.ws.onerror = function(event) {
            Util.debug('aw shite, error', 'error');
            Util.debug(event);
        };
        self.ws.onclose = function() {
            Util.debug('close :(', 'error');
        };
        self.connected = new Promise(function(resolve, reject) {
            self.ws.onopen = function() {
                Util.debug('connected to server', 'log');
                resolve();
            };
        });

        self.messageRegister = {};
        self.ws.onmessage = function(event) {
            Util.debug('got message from server', 'log');
            var msg = JSON.parse(event.data);
            var subs = self.messageRegister[msg.type];
            for (var i = 0; i < subs.length; i++) {
                // async(function() {
                subs[i](msg);
                // });
            }
        };
    }

    CCServer.prototype.getResourcePeers = function(url) {
        var self = this;
        var url = location.host + '::' + url;
        var promise = new Promise(function(resolve, reject) {
            self.connected.then(function() {
                var uuid = self._uuid();
                var msg = {
                    type: 'peerrequest',
                    requestId: uuid,
                    resourceId: btoa(url)
                };

                // register for response
                self._oneTimeSubscribe('peerresponse', function(message) {
                    if (message.requestId == uuid) {
                        Util.debug('got peers', 'log');
                        resolve(message.peers);
                    }
                });
                self._sendObj(msg);
            });
        });
        return promise;
    };

    CCServer.prototype.registerResource = function(url) {
        var url = location.host + '::' + url;
        var msg = {
            type: 'resourceregister',
            resourceId: btoa(url)
        };
        this._sendObj(msg);
    };

    CCServer.prototype._uuid = function() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16);
    };

    CCServer.prototype._oneTimeSubscribe = function(type, fn) {
        var self = this;
        self.messageRegister[type] = self.messageRegister[type] || [];
        self.messageRegister[type].push(fn);
    };

    CCServer.prototype._sendObj = function(obj) {
        obj.meta = obj.meta || {};
        obj.meta.peerId = this.peerId;
        console.log('sending ' + obj);
        this.ws.send(JSON.stringify(obj));
    };

    return CCServer;
});
