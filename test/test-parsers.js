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
        locals.forEach(function(local) {
            test.deepEqual(local, {
                candidateType: ['host'],
                transport: ['udp'],
                ipAddress: ['10.242.72.102:52867'],
                networkType: ['unknown']
            });
        });

        // test.deepEqual(DebugWebRTC.statsParser.getLocalCandidates.candidates['Cand-WdlcS0CI'], {
        //     candidateType: ['host'],
        //     ipAddress: ['10.242.72.102:52867'],
        //     portNumber: 52867,
        //     networkType: ['unknown'],
        //     priority: 2113937151,
        //     transport: ['udp'],
        //     timestamp: '2017-09-01T02:55:32.737Z',
        //     id: 'Cand-WdlcS0CI',
        //     type: 'localcandidate'
        // });
        test.done();
    },
    'parse getRemotecandidate': function(test) {
        var remotes = DebugWebRTC.statsParser.getRemotecandidate(results);
        remotes.forEach(function(remote) {
            test.deepEqual(remote, {
                candidateType: ['host'],
                transport: ['udp'],
                ipAddress: ['10.242.72.102:57309'],
                networkType: []
            });
        });
        // test.deepEqual(DebugWebRTC.statsParser.getRemotecandidate.candidates, {
        //     'Cand-e3PTgP2x': {
        //         candidateType: ['host'],
        //         ipAddress: ['10.242.72.102:57309'],
        //         portNumber: 57309,
        //         networkType: [],
        //         priority: 2113937151,
        //         transport: ['udp'],
        //         timestamp: '2017-09-01T02:55:32.737Z',
        //         id: 'Cand-e3PTgP2x',
        //         type: 'remotecandidate'
        //     }
        // });
        test.done();
    },
    'parse getConnectioin': function(test) {
        var conn = DebugWebRTC.statsParser.getConnectioin(results);
        test.deepEqual(conn, {
            systemIpAddress: '192.168.1.2',
            transport: 'udp',
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
        //var streams = DebugWebRTC.statsParser.getStreams(results);
        // test.deepEqual(streams, {
        //     video: {
        //         send: 1,
        //         recv: 1
        //     },
        //     audio: {
        //         send: 1,
        //         recv: 1
        //     }
        // });

        test.done();
    }
};