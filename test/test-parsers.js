var DebugWebRTC = require('../src/index');

const results = require('./data-results.js');

module.exports = {
    'parse checkIfOfferer': function(test) {
        var ifOfferer = DebugWebRTC.statsParser.checkIfOfferer(results);
        test.strictEqual(ifOfferer, false);
        test.done();
    },
    'parse getPrintAlgorithm': function(test) {
        var pa = DebugWebRTC.statsParser.getPrintAlgorithm(results);
        test.strictEqual(pa, 'sha-256');
        test.done();
    },
    'parse checkAudioTracks': function(test) {
        var audio = DebugWebRTC.statsParser.checkAudioTracks(results);
        test.deepEqual(audio, {
            send: {
                tracks: ['d23c1bf9-8e91-4362-bf40-c84cb56e8d16'],
                codecs: ['opus'],
                availableBandwidth: 0
            },
            recv: {
                tracks: ['d23c1bf9-8e91-4362-bf40-c84cb56e8d16'],
                codecs: ['opus'],
                availableBandwidth: 0
            }
        });
        test.strictEqual(DebugWebRTC.statsParser.checkAudioTracks.prevBytesSent, '96183');
        test.strictEqual(DebugWebRTC.statsParser.checkAudioTracks.prevBytesReceived, '96289');

        test.done();
    },
    'parse checkVideoTracks': function(test) {
        var video = DebugWebRTC.statsParser.checkVideoTracks(results);
        test.deepEqual(video, {
            send: {
                tracks: ['ff0a4556-bfd5-4bac-bd2f-94f2f2919c80'],
                codecs: ['VP9'],
                availableBandwidth: 0,
                resolutions: {
                    width: 640,
                    height: 480
                }
            },
            recv: {
                tracks: ['ff0a4556-bfd5-4bac-bd2f-94f2f2919c80'],
                codecs: ['VP9'],
                availableBandwidth: 0,
                resolutions: {
                    width: 640,
                    height: 480
                }
            }
        });
        test.strictEqual(DebugWebRTC.statsParser.checkVideoTracks.prevBytesSent, '4109772');
        test.strictEqual(DebugWebRTC.statsParser.checkVideoTracks.prevBytesReceived, '3376635');
        test.done();
    },
    'parse getLocalCandidates': function(test) {
        var locals = DebugWebRTC.statsParser.getLocalCandidates(results);
        test.deepEqual(locals, [{
            candidateType: 'host',
            transport: 'udp',
            ipAddress: '10.242.72.102:52867',
            networkType: 'unknown'
        }]);

        test.done();
    },
    'parse getRemotecandidate': function(test) {
        var remotes = DebugWebRTC.statsParser.getRemotecandidate(results);
        test.deepEqual(remotes, [{
            candidateType: 'host',
            transport: 'udp',
            ipAddress: '10.242.72.102:57309'
        }, {
            candidateType: 'serverreflexive',
            transport: 'udp',
            ipAddress: '123.58.160.131:4878'
        }, {
            candidateType: 'serverreflexive',
            transport: 'udp',
            ipAddress: '123.58.160.131:4870'
        }, {
            candidateType: 'serverreflexive',
            transport: 'udp',
            ipAddress: '43.230.90.181:57309'
        }, {
            candidateType: 'relayed',
            transport: 'udp',
            ipAddress: '64.251.31.85:60423'
        }, {
            candidateType: 'relayed',
            transport: 'udp',
            ipAddress: '64.251.31.85:54876'
        }]);
        test.done();
    },
    'parse getConnectioin': function(test) {
        var conn = DebugWebRTC.statsParser.getConnectioin(results);
        test.deepEqual(conn, {
            transport: 'udp',
            rtt: 1,
            localAddress: '10.242.72.102:52867',
            remoteAddress: '10.242.72.102:57309',
            packetsSent: 5131,
            bytesSent: 4248192,
            bytesReceived: 3511972,
            requestsSent: 13,
            requestsReceived: 11,
            responsesSent: 11,
            responsesReceived: 13,
            locals: DebugWebRTC.statsParser.getLocalCandidates(results),
            remotes: DebugWebRTC.statsParser.getRemotecandidate(results)
        });
        test.done();
    },
    'parse getDataSentReceived': function(test) {
        var bytes = DebugWebRTC.statsParser.getDataSentReceived(results);
        test.deepEqual(bytes, {
            video: {
                bytesSent: 4109772,
                bytesReceived: 3376635
            },
            audio: {
                bytesSent: 96183,
                bytesReceived: 96289
            }
        });
        test.done();
    },
    'parese getStreams': function(test) {
        var streams = DebugWebRTC.statsParser.getStreams(results);
        test.deepEqual(streams, {
            video: {
                send: 1,
                recv: 1
            },
            audio: {
                send: 1,
                recv: 1
            }
        });

        test.done();
    }
};