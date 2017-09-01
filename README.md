# debugWebRTC
A tiny JavaScript debugging utility using WebRTC getStats API to debug WebRTC Application.

## Installation

```bash
$ npm install debugwebrtc
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
