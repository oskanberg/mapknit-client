define(['Util'], function(Util) {

    function ResourceConnection(connection, peerId) {
        var self = this;
        self.peerId = peerId;
        self.peerCon = connection.connect(peerId);
        self.isConnected = new Promise(function(resolve, reject) {
            self.peerCon.on('open', function() {
                Util.debug('connected to peer', 'log');
                resolve();
            });
        });
    }

    ResourceConnection.prototype.requestImage = function(src) {
        var self = this;
        var msg = {
            type : 'resourcerequest'
        };
        var promise = new Promise(function (resolve, reject) {
            self.isConnected.then(function() {
                self.peerCon.send(msg);
                self.peerCon.on('data', function(data) {
                    console.log('yay got my stuff');
                    resolve(data);
                });
            });
        });
        return promise;
    };

    ResourceConnection.prototype.sayHello = function() {
        var self = this;
        self.isConnected.then(function() {
            self.peerCon.send({
                'hello': true
            });
        });
    };

    return ResourceConnection;
});
