exports = module.exports = DebugWebRTC;

//webrtc statistics types
var TYPES = {
    TYPE_GOOG_TRACK: 'googTrack',
    TYPE_GOOG_LIBJINGLE_SESSION: 'googLibjingleSession',
    TYPE_GOOG_CERTIFICATE: 'googCertificate',
    TYPE_GOOG_COMPONENT: 'googComponent',
    TYPE_GOOG_CANDIDATE_PAIR: 'googCandidatePair',
    TYPE_LOCAL_CANDIDATE: 'localcandidate',
    TYPE_REMOTE_CANDIDATE: 'remotecandidate',
    TYPE_SSRC: 'ssrc',
    TYPE_VIDEOBWE: 'VideoBwe',
    TYPE_ALL: 'all'
};

//内置的结果解析器
var PARSERS = {
    PARSER_CHECK_IF_OFFERER: 'checkIfOfferer',
    PARSER_GET_PRINT_ALGORITHM: 'getPrintAlgorithm',
    PARSER_CHECK_AUDIO_TRACKS: 'checkAudioTracks',
    PARSER_CHECK_VIDEO_TRACKS: 'checkVideoTracks',
    PARSER_GET_CONNECTION: 'getConnectioin',
    PARSER_GET_LOCAL_CANDIDATES: 'getLocalCandidates',
    PARSER_GET_REMOTE_CANDIDATES: 'getRemotecandidate',
    PARSER_GET_DATA_SENT_RECEIVED: 'getDataSentReceived',
    PARSER_GET_STREAMS: 'getStreams'
};

DebugWebRTC.TYPES = TYPES;
DebugWebRTC.PARSERS = PARSERS;

var statsParser = DebugWebRTC.statsParser = {};

statsParser.checkIfOfferer = function(results) {

    for (var i = 0; i < results.length; i++) {
        if (results[i].type === TYPES.TYPE_GOOG_LIBJINGLE_SESSION) {
            return results[i].googInitiator === 'true';
        }
    }
    return !1;
};

statsParser.getPrintAlgorithm = function(results) {
    for (var i = 0; i < results.length; i++) {
        if (results[i].type === TYPES.TYPE_GOOG_CERTIFICATE) {
            return results[i].googFingerprintAlgorithm;
        }
    }
    return '';
};

statsParser.checkAudioTracks = function(results) {

    var audio = {
        send: {
            tracks: [],
            codecs: [],
            availableBandwidth: 0
        },
        recv: {
            tracks: [],
            codecs: [],
            availableBandwidth: 0
        }
    };


    for (var i = 0; i < results.length; i++) {
        var ret = results[i];

        if (ret.googCodecName && ret.mediaType === 'audio') {
            var type = ret.id.split('_').pop();

            if (audio[type].codecs.indexOf(ret.googCodecName) === -1) {
                audio[type].codecs.push(ret.googCodecName);
            }
            if (audio[type].tracks.indexOf(ret.googTrackId)) {
                audio[type].tracks.push(ret.googTrackId);
            }
            var bytes = 0;
            if (ret.bytesSent) {
                if (!statsParser.checkAudioTracks.prevBytesSent) {
                    statsParser.checkAudioTracks.prevBytesSent = ret.bytesSent;
                }

                bytes = ret.bytesSent - statsParser.checkAudioTracks.prevBytesSent;
                statsParser.checkAudioTracks.prevBytesSent = ret.bytesSent;

            }

            if (ret.bytesReceived) {
                if (!statsParser.checkAudioTracks.prevBytesReceived) {
                    statsParser.checkAudioTracks.prevBytesReceived = ret.bytesReceived;
                }

                bytes = ret.bytesReceived - statsParser.checkAudioTracks.prevBytesReceived;
                statsParser.checkAudioTracks.prevBytesReceived = ret.bytesReceived;
            }

            audio[type].availableBandwidth = (bytes / 1024).toFixed(1);

        }
    }
    return audio;
};

statsParser.checkVideoTracks = function(results) {
    var video = {
        send: {
            tracks: [],
            codecs: [],
            availableBandwidth: 0,
            resolutions: {
                width: 0,
                height: 0
            }
        },
        recv: {
            tracks: [],
            codecs: [],
            availableBandwidth: 0,
            resolutions: {
                width: 0,
                height: 0
            }
        }
    };


    for (var i = 0; i < results.length; i++) {
        var ret = results[i];

        if (ret.googCodecName && ret.mediaType === 'video') {
            var type = ret.id.split('_').pop();

            if (video[type].codecs.indexOf(ret.googCodecName) === -1) {
                video[type].codecs.push(ret.googCodecName);
            }

            if (video[type].tracks.indexOf(ret.googTrackId) === -1) {
                video[type].tracks.push(ret.googTrackId);
            }

            if (ret.googFrameHeightReceived && ret.googFrameWidthReceived) {
                video[type].resolutions.height = ret.googFrameHeightReceived;
                video[type].resolutions.width = ret.googFrameWidthReceived;
            }

            if (ret.googFrameHeightSent && ret.googFrameWidthSent) {
                video[type].resolutions.height = ret.googFrameHeightSent;
                video[type].resolutions.width = ret.googFrameWidthSent;
            }

            var bytes = 0;
            if (ret.bytesSent) {
                if (!statsParser.checkVideoTracks.prevBytesSent) {
                    statsParser.checkVideoTracks.prevBytesSent = ret.bytesSent;
                }

                bytes = ret.bytesSent - statsParser.checkVideoTracks.prevBytesSent;
                statsParser.checkVideoTracks.prevBytesSent = ret.bytesSent;
            }
            if (ret.bytesReceived) {
                if (!statsParser.checkVideoTracks.prevBytesReceived) {
                    statsParser.checkVideoTracks.prevBytesReceived = ret.bytesReceived;
                }

                bytes = ret.bytesReceived - statsParser.checkVideoTracks.prevBytesReceived;
                statsParser.checkVideoTracks.prevBytesReceived = ret.bytesReceived;
            }
            video[type].availableBandwidth = (bytes / 2014).toFixed(1);

        }
    }

    return video;
};

statsParser.getConnectioin = function(results) {
    var connection = {
        systemIpAddress: '192.168.1.2',
        transport: '',
        local: {
            candidateType: [],
            transport: [],
            ipAddress: [],
            networkType: []
        },
        remote: {
            candidateType: [],
            transport: [],
            ipAddress: [],
            networkType: []
        }
    };

    for (var i = 0; i < results.length; i++) {
        var ret = results[i],
            cid = '',
            candidate = null;
        if (ret.type === TYPES.TYPE_GOOG_CANDIDATE_PAIR && ret.googActiveConnection === 'true') {
            connection.transport = ret.googTransportType;

            for (cid in statsParser.getLocalCandidates.candidates) {
                if (statsParser.getLocalCandidates.candidates.hasOwnProperty(cid)) {
                    candidate = statsParser.getLocalCandidates.candidates[cid];
                    if (candidate.ipAddress.indexOf(ret.googLocalAddress) !== -1) {
                        connection.local.candidateType = candidate.candidateType;
                        connection.local.ipAddress = candidate.ipAddress;
                        connection.local.networkType = candidate.networkType;
                        connection.local.transport = candidate.transport;
                    }
                }
            }

            for (cid in statsParser.getRemotecandidate.candidates) {
                if (statsParser.getRemotecandidate.candidates.hasOwnProperty(cid)) {
                    candidate = statsParser.getRemotecandidate.candidates[cid];
                    if (candidate.ipAddress.indexOf(ret.googRemoteAddress) !== -1) {
                        connection.remote.candidateType = candidate.candidateType;
                        connection.remote.ipAddress = candidate.ipAddress;
                        connection.remote.networkType = candidate.networkType;
                        connection.remote.transport = candidate.transport;
                    }
                }
            }

            var localCandidate = statsParser.getLocalCandidates.candidates[ret.localCandidateId];
            if (localCandidate) {
                if (localCandidate.ipAddress) {
                    connection.systemIpAddress = localCandidate.ipAddress;
                }
            }

            var remoteCandidate = statsParser.getRemotecandidate.candidates[ret.remoteCandidateId];
            if (remoteCandidate) {
                if (remoteCandidate.ipAddress) {
                    connection.systemIpAddress = remoteCandidate.ipAddress;
                }
            }
        }
    }

    return connection;
};


var LOCAL_candidateType = {};
var LOCAL_transport = {};
var LOCAL_ipAddress = {};
var LOCAL_networkType = {};
statsParser.getLocalCandidates = function(results) {
    var locals = [];

    for (var i = 0; i < results[i].length; i++) {
        var ret = results[i];

        if (ret.type === TYPES.TYPE_LOCAL_CANDIDATE && ret.id) {
            if (!LOCAL_candidateType[ret.id]) {
                LOCAL_candidateType[ret.id] = [];
            }

            if (!LOCAL_transport[ret.id]) {
                LOCAL_transport[ret.id] = [];
            }

            if (!LOCAL_ipAddress[ret.id]) {
                LOCAL_ipAddress[ret.id] = [];
            }

            if (!LOCAL_networkType[ret.id]) {
                LOCAL_networkType[ret.id] = [];
            }

            if (ret.candidateType && LOCAL_candidateType[ret.id].indexOf(ret.candidateType) === -1) {
                LOCAL_candidateType[ret.id].push(ret.candidateType);
            }

            if (ret.transport && LOCAL_transport[ret.id].indexOf(ret.transport) === -1) {
                LOCAL_transport[ret.id].push(ret.transport);
            }

            if (ret.ipAddress && LOCAL_ipAddress[ret.id].indexOf(ret.ipAddress + ':' + ret.portNumber) === -1) {
                LOCAL_ipAddress[ret.id].push(ret.ipAddress + ':' + ret.portNumber);
            }

            if (ret.networkType && LOCAL_networkType[ret.id].indexOf(ret.networkType) === -1) {
                LOCAL_networkType[ret.id].push(ret.networkType);
            }

            statsParser.getLocalCandidates.candidates[ret.id] = {
                candidateType: LOCAL_candidateType[ret.id],
                ipAddress: LOCAL_ipAddress[ret.id],
                portNumber: ret.portNumber,
                networkType: LOCAL_networkType[ret.id],
                priority: ret.priority,
                transport: LOCAL_transport[ret.id],
                timestamp: ret.timestamp,
                id: ret.id,
                type: ret.type
            };

            locals.push({
                candidateType: LOCAL_candidateType[ret.id],
                ipAddress: LOCAL_ipAddress[ret.id],
                networkType: LOCAL_networkType[ret.id],
                transport: LOCAL_transport[ret.id]
            });
        }
    }
    return locals;
};
statsParser.getLocalCandidates.candidates = {};



var REMOTE_candidateType = {};
var REMOTE_transport = {};
var REMOTE_ipAddress = {};
var REMOTE_networkType = {};
statsParser.getRemotecandidate = function(results) {
    var remotes = [];

    for (var i = 0; i < results[i].length; i++) {
        var ret = results[i];

        if (ret.type === TYPES.TYPE_REMOTE_CANDIDATE && ret.id) {
            if (!REMOTE_candidateType[ret.id]) {
                REMOTE_candidateType[ret.id] = [];
            }

            if (!REMOTE_transport[ret.id]) {
                REMOTE_transport[ret.id] = [];
            }

            if (!REMOTE_ipAddress[ret.id]) {
                REMOTE_ipAddress[ret.id] = [];
            }

            if (!REMOTE_networkType[ret.id]) {
                REMOTE_networkType[ret.id] = [];
            }

            if (ret.candidateType && REMOTE_candidateType[ret.id].indexOf(ret.candidateType) === -1) {
                REMOTE_candidateType[ret.id].push(ret.candidateType);
            }

            if (ret.transport && REMOTE_transport[ret.id].indexOf(ret.transport) === -1) {
                REMOTE_transport[ret.id].push(ret.transport);
            }

            if (ret.ipAddress && REMOTE_ipAddress[ret.id].indexOf(ret.ipAddress + ':' + ret.portNumber) === -1) {
                REMOTE_ipAddress[ret.id].push(ret.ipAddress + ':' + ret.portNumber);
            }

            if (ret.networkType && REMOTE_networkType[ret.id].indexOf(ret.networkType) === -1) {
                REMOTE_networkType[ret.id].push(ret.networkType);
            }

            statsParser.getRemoteCandidates.candidates[ret.id] = {
                candidateType: REMOTE_candidateType[ret.id],
                ipAddress: REMOTE_ipAddress[ret.id],
                portNumber: ret.portNumber,
                networkType: REMOTE_networkType[ret.id],
                priority: ret.priority,
                transport: REMOTE_transport[ret.id],
                timestamp: ret.timestamp,
                id: ret.id,
                type: ret.type
            };

            remotes.push({
                candidateType: REMOTE_candidateType[ret.id],
                ipAddress: REMOTE_ipAddress[ret.id],
                networkType: REMOTE_networkType[ret.id],
                transport: REMOTE_transport[ret.id]
            });
        }
    }

    return remotes;
};
statsParser.getRemotecandidate.candidates = {};



statsParser.getDataSentReceived = function(results) {
    var bytes = {
        video: {
            bytesSent: 0,
            bytesReceived: 0
        },
        audio: {
            bytesSent: 0,
            bytesReceived: 0
        }
    };

    for (var i = 0; i < results.length; i++) {
        var ret = results[i];

        if (ret.googCodecName && (ret.mediaType === 'video' || ret.mediaType === 'audio')) {
            if (ret.bytesSent) {
                bytes[ret.mediaType].bytesSent = parseInt(ret.bytesSent);
            }
            if (ret.bytesReceived) {
                bytes[ret.mediaType].bytesReceived = parseInt(ret.bytesReceived);
            }
        }
    }

    return bytes;
};

statsParser.getStreams = function(results) {


    for (var i = 0; i < results[i].length; i++) {
        var ret = results[i];

        if (ret.googCodecName && ret.type === 'ssrc' && (ret.mediaType === 'video' || ret.mediaType === 'audio')) {
            var type = ret.id.split('_').pop();

            if (statsParser.getStreams.ssrc[ret.mediaType][type].indexOf(ret.ssrc) === -1) {
                statsParser.getStreams.ssrc[ret.mediaType][type].push(ret.ssrc);
            }
        }
    }

    return {
        video: {
            send: statsParser.getStreams.ssrc.video.send.length,
            recv: statsParser.getStreams.ssrc.video.recv.length
        },
        audio: {
            send: statsParser.getStreams.ssrc.audio.send.length,
            recv: statsParser.getStreams.ssrc.audio.recv.length
        }
    };

};
statsParser.getStreams.ssrc = {
    audio: {
        send: [],
        recv: []
    },
    video: {
        send: [],
        recv: []
    }
};

/**
 * [DebugWebRTC description]
 * @param {[Object]} config  
 * @param {object} config.peer            PeerConnection instance
 * @param {number} config.interval        getStats interval
 */
function DebugWebRTC(config) {

    config = config || {};

    if (!config.peer) { throw 'cannot find PeerConnection instance'; }

    this.listeners = {};
    this.peer = config.peer;
    this.interval = config.interval || 1000;
    this.start();
}


/**
 * 
 * @param  {[type]} type [description]  TYPES
 * @return {[type]}      [description]
 */
DebugWebRTC.prototype.on = function(type, fn) {
    if (this.listeners[type]) {
        this.listeners[type].push(fn);
    } else {
        this.listeners[type] = [fn];
    }
};

DebugWebRTC.prototype.stop = function() {
    this.do = false;
};
DebugWebRTC.prototype.start = function() {
    this.do = true; //是否要获取统计数据
    getStatsLooper.call(this);
};

function getStatsLooper() {


    this.peer.getStats(function(res) {
        var items = [],
            listener = '';
        res.result().forEach(function(res) {
            var item = {};
            res.names().forEach(function(name) {
                item[name] = res.stat(name);
            });
            item.id = res.id;
            item.type = res.type;
            item.timestamp = res.timestamp;
            items.push(item);
        });

        for (listener in this.listeners) {
            if (TYPES.values().indexOf(listener) !== -1) {
                emit.apply(this, [listener, items.filter(function(itm) { return itm.type === listener; })]);
            }

            if (statsParser.keys().indexOf(listener) !== -1) {
                emit.apply(this, [listener, statsParser[listener](items)]);
            }
        }


    });
    try {
        // failed|closed  停掉获取
        if (this.peer.iceConnectionState.search(/failed/gi) !== -1) {
            this.do = false;
        }
    } catch (e) {
        this.do = false;

    }

    // second argument checks to see, if target-user is still connected.
    if (this.do) {
        setTimeout(getStatsLooper.bind(this), this.interval);
    }

}



function emit() {
    var args = Array.prototype.slice.call(arguments);
    var event = args.shift();
    if (this.listeners[event]) {
        this.listeners[event].forEach(function(fn) {
            fn.apply(null, args);
        });
    }
}