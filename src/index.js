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
DebugWebRTC.freeice = require('freeice');

var statsParser = DebugWebRTC.statsParser = {};

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
    clearTimeout(this.timer);
    this.timer = null;
};
DebugWebRTC.prototype.start = function() {
    this.do = true; //是否要获取统计数据
    this.timer = setTimeout(getStatsLooper.bind(this), this.interval);
};
DebugWebRTC.prototype.destroy = function() {
    this.stop();
    this.listeners = null;
    this.peer = null;
};

function getStatsLooper() {
    var self = this;

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

        for (listener in self.listeners) {
            if (Object.values(TYPES).indexOf(listener) !== -1) {
                emit.apply(self, [listener, items.filter(function(itm) {
                    if (listener === TYPES.TYPE_ALL) {
                        return true;
                    }

                    return itm.type === listener;
                })]);
            }

            if (Object.keys(statsParser).indexOf(listener) !== -1) {
                emit.apply(self, [listener, statsParser[listener](items)]);
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
        this.timer = setTimeout(getStatsLooper.bind(this), this.interval);
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

statsParser.getLocalCandidates = function(results) {
    var locals = [];

    for (var i = 0; i < results.length; i++) {
        var ret = results[i],
            local = null;

        if (ret.type === TYPES.TYPE_LOCAL_CANDIDATE && ret.id) {

            local = {};

            if (ret.candidateType) {
                local.candidateType = ret.candidateType;
            }

            if (ret.transport) {
                local.transport = ret.transport;
            }

            if (ret.ipAddress) {
                local.ipAddress = ret.ipAddress + ':' + ret.portNumber;
            }

            if (ret.networkType) {
                local.networkType = ret.networkType;
            }

            locals.push(local);
        }
    }
    return locals;
};

statsParser.getRemotecandidate = function(results) {
    var remotes = [];

    for (var i = 0; i < results.length; i++) {
        var ret = results[i],
            remote = null;

        if (ret.type === TYPES.TYPE_REMOTE_CANDIDATE && ret.id) {

            remote = {};

            if (ret.candidateType) {
                remote.candidateType = ret.candidateType;
            }

            if (ret.transport) {
                remote.transport = ret.transport;
            }

            if (ret.ipAddress) {
                remote.ipAddress = ret.ipAddress + ':' + ret.portNumber;
            }

            if (ret.networkType) {
                remote.networkType = ret.networkType;
            }

            remotes.push(remote);
        }
    }

    return remotes;
};

statsParser.getConnectioin = function(results) {
    var connection = {
        transport: '',
        rtt: 0,
        localAddress: '',
        remoteAddress: '',
        packetsSent: 0,
        bytesSent: 0,
        bytesReceived: 0,
        requestsSent: 0,
        requestsReceived: 0,
        responsesSent: 0,
        responsesReceived: 0
    };

    for (var i = 0; i < results.length; i++) {
        var ret = results[i];
        if (ret.type === TYPES.TYPE_GOOG_CANDIDATE_PAIR && ret.googActiveConnection === 'true') {
            connection.transport = ret.googTransportType;
            connection.rtt = parseInt(ret.googRtt);
            connection.localAddress = ret.googLocalAddress;
            connection.remoteAddress = ret.googRemoteAddress;
            connection.packetsSent = parseInt(ret.packetsSent);
            connection.bytesSent = parseInt(ret.bytesSent);
            connection.bytesReceived = parseInt(ret.bytesReceived);
            connection.requestsSent = parseInt(ret.requestsSent);
            connection.requestsReceived = parseInt(ret.requestsReceived);
            connection.responsesSent = parseInt(ret.responsesSent);
            connection.responsesReceived = parseInt(ret.responsesReceived);
        }
    }

    connection.locals = statsParser.getLocalCandidates(results);
    connection.remotes = statsParser.getRemotecandidate(results);

    return connection;
};


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

    var ssrc = {
        audio: {
            send: {
                bytes: 0,
                packets: 0,
                packetsLost: 0,
                googRtt: 0,
                googJitterReceived: 0
            },
            recv: {
                bytes: 0,
                packets: 0,
                packetsLost: 0,
                googJitterReceived: 0,
                googJitterBufferMs: 0
            }
        },
        video: {
            send: {
                bytes: 0,
                packets: 0,
                packetsLost: 0,
                googRtt: 0,
                googEncodeUsagePercent: 0
            },
            recv: {
                bytes: 0,
                packets: 0,
                packetsLost: 0,
                googCurrentDelayMs: 0,
                googJitterBufferMs: 0
            }
        }
    };

    for (var i = 0; i < results.length; i++) {
        var ret = results[i];

        if (ret.googCodecName && ret.type === 'ssrc' && (ret.mediaType === 'video' || ret.mediaType === 'audio')) {
            var type = ret.id.split('_').pop();

            ssrc[ret.mediaType][type].bytes = parseInt(ret.bytesReceived || ret.bytesSent);
            ssrc[ret.mediaType][type].packets = parseInt(ret.packetsReceived || ret.packetsSent);
            ssrc[ret.mediaType][type].packetsLost = parseInt(ret.packetsLost);

            if (type === 'send') {
                ssrc[ret.mediaType].send.googRtt = parseInt(ret.googRtt);

                if (ret.mediaType === 'audio') {
                    ssrc.audio.send.googJitterReceived = parseInt(ret.googJitterReceived);
                } else {
                    ssrc.video.send.googEncodeUsagePercent = parseInt(ret.googEncodeUsagePercent);
                }

            } else {
                ssrc[ret.mediaType].recv.googJitterBufferMs = parseInt(ret.googJitterBufferMs);

                if (ret.mediaType === 'audio') {
                    ssrc.audio.recv.googJitterReceived = parseInt(ret.googJitterReceived);
                } else {
                    ssrc.video.recv.googCurrentDelayMs = parseInt(ret.googCurrentDelayMs);
                }
            }
        }
    }

    return ssrc;

};