# debugWebRTC
A tiny JavaScript debugging utility using WebRTC getStats API to debug WebRTC Application.

## Installation

### npm

```bash
$ npm install debugwebrtc
```

### browser support

You just need to have [Node.js](http://nodejs.org/) to build debugwebrtc.js and debugwebrtc.min.js

1. [Install Node.js](https://nodejs.org/en/download/)
2. Install `gulp-cli` (>= 1.2.2) globally (which provides the `gulp` command):

```bash
$ npm install -g gulp-cli
```

3. Install the Node.js dependencies:

```bash
$ npm install
```

Finally, run `gulp dist` (or just `gulp`) to get:

* `dist/debugwebrtc.js`: uncompressed version of DebugWebRTC.
* `dist/debugwebrtc.min.js`: compressed version of DebugWebRTC.

```bash
$ gulp dist
```

4. then you can use it directed in your web page as follows:

``` html
<!DOCTYPE html>
<html>
<head>
    <title></title>
    <script src="./dist/debugwebrtc.js"></script>
</head>
<body>
    <script>
        var peer = new RTCPeerConnection({
            iceServers: DebugWebRTC.freeice(),
            iceTransportPolicy: 'all',
            rtcpMuxPolicy: 'require',
            bundlePolicy: 'max-bundle'
        });
        var debug = new DebugWebRTC({
            peer: peer,
            interval:1000
        });

        //TYPES
        debug.on(DebugWebRTC.TYPES.TYPE_VIDEOBWE, function (results) {
            // do your work
        });

        //PARSERS
        debug.on(DebugWebRTC.PARSERS.PARSER_CHECK_AUDIO_TRACKS, function (audio) {
            //do your work
        });
        
    </script>

</body>
</html>
```


## Usage

```js
var DebugWebRTC = require('debugwebrtc');
var peer = new RTCPeerConnection({
    iceServers: DebugWebRTC.freeice(),
    iceTransportPolicy: 'all',
    rtcpMuxPolicy: 'require',
    bundlePolicy: 'max-bundle'
});

var debug = new DebugWebRTC({
       peer: peer,
       interval: 1000
});

//TYPES
debug.on(DebugWebRTC.TYPES.TYPE_VIDEOBWE, function (results) {
    // do your work
});

//PARSERS
debug.on(DebugWebRTC.PARSERS.PARSER_CHECK_AUDIO_TRACKS, function (audio) {
    //do your work
});

debug.stop();//Stop getting statistics, you can re-start it by start api
debug.start();//Re-start getting statistics 


//......
//......
//......

//Stop getting the statistics and destroy the instance
debug.desroy();

```


## TYPES

```js
var DebugWebRTC = require('debugwebrtc');
var debug = new DebugWebRTC(option);

//debug.on(DebugWebRTC.TYPES.TYPE_xxxxxxx);
//DebugWebRTC.TYPES

```

The utility defines several types, and when you listen to a type, you can get that type of data. All available types are as follows:

| TYPES | Representation |
|-----------|----------------|
| TYPE_GOOG_TRACK      | 'googTrack':googTrack infomations |
| TYPE_GOOG_LIBJINGLE_SESSION      | 'googLibjingleSession':googLibjingleSession infomations |
| TYPE_GOOG_CERTIFICATE      | 'googCertificate':googCertificate infomations |
| TYPE_GOOG_COMPONENT      | 'googComponent':googComponent infomations |
| TYPE_GOOG_CANDIDATE_PAIR      | 'googCandidatePair':googCandidatePair infomations |
| TYPE_LOCAL_CANDIDATE      | 'localcandidate':localcandidate infomations |
| TYPE_REMOTE_CANDIDATE      | 'remotecandidate':remotecandidate infomations |
| TYPE_SSRC      | 'ssrc': ssrc infomations |
| TYPE_VIDEOBWE      | 'VideoBwe': VideoBwe infomations |
| TYPE_ALL      | 'all':all infomations |

## PARSERS 

```js
var DebugWebRTC = require('debugwebrtc');
var debug = new DebugWebRTC(option);

//debug.on(DebugWebRTC.PARSERS.PARSE_xxxxxxx);
//DebugWebRTC.PARSERS

```

In addition to the type, the utility also defines several parsers because the type used is to get the raw data for that type, and in most cases we often want to get the analyzed data.Then these parsers will be introduced one by one。

| PARSERS | Representation |
|-----------|----------------|
| PARSER_CHECK_IF_OFFERER      | 'checkIfOfferer': check is offerer or not |
| PARSER_GET_PRINT_ALGORITHM      | 'getPrintAlgorithm': get print algorithm, 'sha-256' e.g. |
| PARSER_CHECK_AUDIO_TRACKS      | 'checkAudioTracks': get audio tracks |
| PARSER_CHECK_VIDEO_TRACKS      | 'checkVideoTracks': get video tracks |
| PARSER_GET_LOCAL_CANDIDATES      | 'getLocalCandidates': localcandidates |
| PARSER_GET_REMOTE_CANDIDATES      | 'getRemotecandidate':remotecandidates |
| PARSER_GET_CONNECTION      | 'getConnectioin': get connection infomations |
| PARSER_GET_DATA_SENT_RECEIVED      | 'getDataSentReceived': data sent or reveied |
| PARSER_GET_STREAMS      | 'getStreams': streams |

### PARSER_CHECK_IF_OFFERER

Check if the current PeerConnection instance is an offerer. 

```js
//PARSER_CHECK_IF_OFFERER
debug.on(DebugWebRTC.PARSERS.PARSER_CHECK_AUDIO_TRACKS, function (isOfferer) {
    // do your work when you will get isOfferer as follows 
    // true or false
});
```

### PARSER_GET_PRINT_ALGORITHM

Gets the encryption algorithm for the current PeerConnection instance.

```js
//PARSER_GET_PRINT_ALGORITHM
debug.on(DebugWebRTC.PARSERS.PARSER_GET_PRINT_ALGORITHM, function (algorithm) {
    // do your work when you will get the algorithm as follows 
    //algorithm:  'sha-256' or other algorithm
});
```

### PARSER_CHECK_AUDIO_TRACKS

Get audio tracks data for the current PeerConnection instance.

```js
//PARSER_CHECK_AUDIO_TRACKS
debug.on(DebugWebRTC.PARSERS.PARSER_CHECK_AUDIO_TRACKS, function (audio) {
    // do your work when you will get the audio data as follows 
    // {
    //        send: {
    //            tracks: ['d23c1bf9-8e91-4362-bf40-c84cb56e8d16'],
    //            codecs: ['opus'],
    //            availableBandwidth: 0
    //       },
    //        recv: {
    //            tracks: ['d23c1bf9-8e91-4362-bf40-c84cb56e8d16'],
    //            codecs: ['opus'],
    //            availableBandwidth: 0
    //        }
    //    }
});
```


### PARSER_CHECK_VIDEO_TRACKS

Get video tracks data for the current PeerConnection instance.

```js
//PARSER_CHECK_VIDEO_TRACKS
debug.on(DebugWebRTC.PARSERS.PARSER_CHECK_VIDEO_TRACKS, function (video) {
    // do your work when you will get the video data as follows 
    //    {
    //        send: {
    //            tracks: ['ff0a4556-bfd5-4bac-bd2f-94f2f2919c80'],
    //            codecs: ['VP9'],
    //            availableBandwidth: 0,
    //            resolutions: {
    //                width: 640,
    //                height: 480
    //            }
    //        },
    //        recv: {
    //            tracks: ['ff0a4556-bfd5-4bac-bd2f-94f2f2919c80'],
    //            codecs: ['VP9'],
    //           availableBandwidth: 0,
    //            resolutions: {
    //                width: 640,
    //                height: 480
    //            }
    //        }
    //    }
});
```


### PARSER_GET_LOCAL_CANDIDATES

Get local candidates data for the current PeerConnection instance.

```js
//PARSER_GET_LOCAL_CANDIDATES
debug.on(DebugWebRTC.PARSERS.PARSER_GET_LOCAL_CANDIDATES, function (locals) {
    // do your work when you will get the locals data as follows 
    //[{
    //            candidateType: 'host',
    //            transport: 'udp',
    //            ipAddress: '10.242.72.102:52867',
    //            networkType: 'unknown'
    //        }]
});
```


### PARSER_GET_REMOTE_CANDIDATES

Get remote candidates data for the current PeerConnection instance.

```js
//PARSER_GET_REMOTE_CANDIDATES
debug.on(DebugWebRTC.PARSERS.PARSER_GET_REMOTE_CANDIDATES, function (remotes) {
    // do your work when you will get the remotes data as follows 
    //        [{
    //            candidateType: 'host',
    //            transport: 'udp',
    //            ipAddress: '10.242.72.102:57309'
    //        }, {
    //            candidateType: 'serverreflexive',
    //            transport: 'udp',
    //            ipAddress: '123.58.160.131:4878'
    //        }, {
    //            candidateType: 'serverreflexive',
    //            transport: 'udp',
    //            ipAddress: '123.58.160.131:4870'
    //        }, {
    //            candidateType: 'serverreflexive',
    //            transport: 'udp',
    //            ipAddress: '43.230.90.181:57309'
    //        }, {
    //            candidateType: 'relayed',
    //            transport: 'udp',
    //            ipAddress: '64.251.31.85:60423'
    //        }, {
    //            candidateType: 'relayed',
    //            transport: 'udp',
    //            ipAddress: '64.251.31.85:54876'
    //        }]
});
```

### PARSER_GET_CONNECTION

Get connection data for the current PeerConnection instance.

```js
//PARSER_GET_CONNECTION
debug.on(DebugWebRTC.PARSERS.PARSER_GET_CONNECTION, function (connection) {
    // do your work when you will get the connection data as follows 
    //    {
    //        transport: 'udp',
    //        rtt: 1,
    //        localAddress: '10.242.72.102:52867',
    //        remoteAddress: '10.242.72.102:57309',
    //        packetsSent: 5131,
    //        bytesSent: 4248192,
    //        bytesReceived: 3511972,
    //        requestsSent: 13,
    //        requestsReceived: 11,
    //        responsesSent: 11,
    //        responsesReceived: 13,
    //        locals: [{
    //            candidateType: 'host',
    //            transport: 'udp',
    //            ipAddress: '10.242.72.102:52867',
    //            networkType: 'unknown'
    //        }],
    //        remotes: [{
    //            candidateType: 'host',
    //            transport: 'udp',
    //            ipAddress: '10.242.72.102:57309'
    //        }, {
    //            candidateType: 'serverreflexive',
    //            transport: 'udp',
    //            ipAddress: '123.58.160.131:4878'
    //        }, {
    //            candidateType: 'serverreflexive',
    //            transport: 'udp',
    //            ipAddress: '123.58.160.131:4870'
    //        }, {
    //            candidateType: 'serverreflexive',
    //            transport: 'udp',
    //            ipAddress: '43.230.90.181:57309'
    //        }, {
    //            candidateType: 'relayed',
    //            transport: 'udp',
    //            ipAddress: '64.251.31.85:60423'
    //        }, {
    //            candidateType: 'relayed',
    //            transport: 'udp',
    //            ipAddress: '64.251.31.85:54876'
    //        }]
    //    }

});
```

### PARSER_GET_DATA_SENT_RECEIVED

Get bytes of sent or received data for the current PeerConnection instance.

```js
//PARSER_GET_DATA_SENT_RECEIVED
debug.on(DebugWebRTC.PARSERS.PARSER_GET_DATA_SENT_RECEIVED, function (bytes) {
    // do your work when you will get the bytes data as follows 
    //    {
    //        video: {
    //            bytesSent: 4109772,
    //            bytesReceived: 3376635
    //        },
    //        audio: {
    //            bytesSent: 96183,
    //            bytesReceived: 96289
    //        }
    //    }
});
```

### PARSER_GET_STREAMS

Get streams for the current PeerConnection instance.

```js
//PARSER_GET_STREAMS
debug.on(DebugWebRTC.PARSERS.PARSER_GET_STREAMS, function (streams) {
    // do your work when you will get the streams data as follows 
    //{
    //        audio: {
    //            send: {
    //                bytes: 96183,
    //                packets: 957,
    //                packetsLost: 0,
    //                googRtt: 16,
    //                googJitterReceived: 11
    //            },
    //            recv: {
    //                bytes: 96289,
    //                packets: 958,
    //                packetsLost: 0,
    //                googJitterReceived: 11,
    //                googJitterBufferMs: 76
    //            }
    //        },
    //        video: {
    //            send: {
    //                bytes: 4109772,
    //                packets: 3749,
    //                packetsLost: 0,
    //                googRtt: 8,
    //                googEncodeUsagePercent: 94
    //            },
    //            recv: {
    //                bytes: 3376635,
    //                packets: 3120,
    //                packetsLost: 0,
    //                googCurrentDelayMs: 76,
    //                googJitterBufferMs: 55
    //            }
    //        }
    //}
});
```

## Custom parsers

You can add custom parsers by extending the `DebugWebRTC.statsParser` object.
For example, if you wanted to add support for get xxx data, you could do something like:

```js
var DebugWebRTC = require('debugwebrtc');

//The type of the results is an array,it is the original data of the current PeerConnection instance, that is, the data obtained when TYPE = 'all'.
DebugWebRTC.statsParser.xxx = function(results){
    //do your logic
    //and then return your result
};

var debug = new DebugWebRTC({
       peer: peer,
       interval: 1000
});

//Custom PARSERS
debug.on('xxx', function (result) {
    // do your work
});
```


## License

(The MIT License)

Copyright (c) 2017-2017

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
