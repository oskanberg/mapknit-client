require.config({
    paths: {
        'peerjs': '/bower_components/peerjs/peer'
    }
});

require(['ImageUtils', 'CCServer', 'Util', 'ResourceConnection', 'peerjs', 'shims'], function(ImageUtils, CCServ, Util, ResourceConnection) {

    var ATTRIBUTE_NAME = 'data-src';

    var iu = new ImageUtils();
    var cc = new CCServ();
    var peer = new Peer(cc.peerId, {
        host: 'armitage', port: 9000, path: '/peer'
    });

    peer.on('connection', function(conn) {
        Util.debug('SOMEONE IS TRYING TO CONNECT', 'log');
        conn.on('data', function(message){
            Util.debug('got message','log');
            //TODO: actually logic
            if (message.type === 'resourcerequest') {
                var img = document.querySelector('img');
                var data = iu.getSendableImageData(img);
                console.log('sent message');
                conn.send(data);
            }
        });
    });

    function getLoadCandidates(tag) {
        var elements = document.getElementsByTagName(tag);
        var loadCandidates = [];
        for (var i = 0; i < elements.length; i++) {
            if (elements[i].getAttribute(ATTRIBUTE_NAME) !== null) {
                loadCandidates.push({
                    el: elements[i],
                    src: elements[i].getAttribute(ATTRIBUTE_NAME)
                });
            }
        }
        return loadCandidates;
    }

    function loadImage(image) {
        cc.getResourcePeers(image.src).then(function(candidates) {
            console.log(candidates);
            if (candidates.length === 0) {
                // make sure not to stomp on existing onloads
                var oldOnload = image.el.onload || function() {};
                image.el.onload = function(e) {
                    oldOnload(e);
                    cc.registerResource(image.src);
                };
                // fall back to regular loading
                image.el.src = image.src;
            } else {
                //TODO: prioritisation
                var peerId = candidates[0];
                console.log('IMA LOAD FROM ' + peerId);
                var rc = new ResourceConnection(peer, peerId);
                rc.requestImage(image.src).then(function(data) {
                    console.error('ASSASAAAH');
                    var image = iu.createImageFromSendableData(data);
                    console.log(image);
                    document.body.appendChild(image);
                });
            }
        });
    }

    var imageCandidates = getLoadCandidates('img');

    for (var i = 0; i < imageCandidates.length; i++) {
        loadImage(imageCandidates[i]);
    }

});
