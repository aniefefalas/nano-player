'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Player = function () {
    _createClass(Player, [{
        key: 'initUI',
        value: function initUI() {
            var _this = this;

            this.element.style.position = 'relative';
            this.element.style.width = this.style.width || '300px';
            this.element.style.height = this.style.height || '300px';
            this.element.style.overflow = 'hidden';
            this.element.classList.add('__nano_player__');

            this.uiStatus = 'unfocus';
            this.uiCollection = {};
            this.showingFreq = [];

            // Create the stylesheet and HTML elements and append them to the parent node.
            var style = document.createElement('STYLE');
            style.innerHTML = ['.cover {', '    position: absolute;', '    width: 100%;', '    height: 100%;', '    transition: all ease 0.3s;', '    color: white;', '    cursor: default;', '}', '.blur {', '    filter: blur(10px);', '}', '.hidden {', '    opacity: 0;', '}', 'h1.songTitle {', '    font-weight: normal;', '    margin: 1%;', '    font-size: 150%;', '    text-align: center;', '    white-space: pre;', '    display: inline-block;', '    /*transition: margin-left 0.04s*/', '}', 'h2.songArtist {', '    font-weight: normal;', '    margin-top: 2%;', '    margin-bottom: 0;', '    font-size: 100%;', '    text-align: center;', '    line-height: 1em;', '}', 'div.lyrics {', '    font-weight: normal;', '    margin: 1%;', '    font-size: 80%;', '    text-align: center;', '}', '.progress {', '    position: absolute;', '    bottom: 5%;', '    left: 25%;', '    width: 50%;', '    height: 1%;', '    margin: 0 auto;', '    border: 1px solid white;', '}', '.controls {', '    position: absolute;', '    height: 20%;', '    width: 100%;', '    bottom: 35%;', '    text-align: center;', '}', '.visualizer {', '    position: absolute;', '    bottom: 7%;', '    left: 25%;', '    width: 50%;', '    height: 12%;', '    margin: 0 auto;', '}', 'i.controlButton {', '    min-width: 50px;', '    display: inline-block;', '    text-align: center;', '}', 'i.navButton {', '    cursor: pointer;', '}', '.pointer {', '    cursor: pointer;', '}', '.outside-left {', '    margin-left: -100%;', '}', '.outside-right {', '    margin-left: 100%;', '}', '.playlist {', '    width: 300px;', '    height: 300px;', '    position: relative;', '}', '', '.headbar {', '    background-color: #000;', '    height: 44px;', '    width: 100%;', '    text-align: center;', '}', '', '.list {', '    width: 100%;', '    height: 64px;', '}', '', '.list>.face {', '    position: absolute;', '    height: 64px;', '    width: 64px;', '    display: inline-block;', '    background-size: cover;', '}', '', '.list>.title {', '    position: absolute;', '    padding-left: 1em; ', '    left: 64px;', '    right: 0;', '    display: inline-block;', '    height: 64px;', '    word-wrap: break-word;', '    overflow: hidden;', '    line-height: 64px;', '}'].map(function (line) {
                line = line.trim();
                if (line[line.length - 1] == '{') return '.__nano_player__ ' + line;
                return line;
            }).join(' ');
            style.setAttribute('scoped', '');
            this.element.appendChild(style);

            // Container for all elements excluding stylesheet and <audio>.
            var container = document.createElement('DIV');
            container.classList.add('cover');
            container.style.overflow = 'hidden';

            // Container for title, artist and lyrics.
            var mediainfo = document.createElement('DIV');
            mediainfo.className = 'cover hidden';
            mediainfo.style.zIndex = '2';

            var songTitle = document.createElement('H1');
            songTitle.classList.add('songTitle');

            var songArtist = document.createElement('H2');
            songArtist.classList.add('songArtist');

            var lyrics = document.createElement('DIV');
            lyrics.classList.add('lyrics');

            // Container for control buttons, progress bar and visualizer
            var controller = document.createElement('DIV');
            controller.className = 'cover hidden';
            controller.style.zIndex = '2';
            controller.style.margin = '0 auto';

            var controls = document.createElement('DIV');
            controls.classList.add('controls');

            var playButton = document.createElement('I');
            playButton.className = 'fa fa-play controlButton';
            playButton.setAttribute('aria-hidden', 'true');
            playButton.style.fontSize = '3em';
            playButton.style.marginLeft = playButton.style.marginRight = '10%';

            // play <-> pause
            playButton.addEventListener('click', function (event) {
                if (_this.uiStatus == 'unfocus') // Button is hidden, ignore this click event.
                    return;
                event.stopPropagation(); // Stop parent nodes from getting the click event.
                if (_this.domAudio.paused) {
                    _this.play();
                } else {
                    _this.pause();
                }
            });

            var nextButton = document.createElement('I');
            nextButton.className = 'fa fa-forward controlButton';
            nextButton.setAttribute('aria-hidden', 'true');
            nextButton.style.fontSize = '3em';
            nextButton.addEventListener('click', function (event) {
                // Same as above.
                if (_this.uiStatus == 'unfocus') return;
                event.stopPropagation();
                _this.nextTrack();
            });

            var prevButton = document.createElement('I');
            prevButton.className = 'fa fa-backward controlButton';
            prevButton.setAttribute('aria-hidden', 'true');
            prevButton.style.fontSize = '3em';
            prevButton.addEventListener('click', function (event) {
                if (_this.uiStatus == 'unfocus') return;
                event.stopPropagation();
                _this.prevTrack();
            });

            var progress = document.createElement('DIV');
            progress.className = 'progress';
            progress.overflow = 'hidden';
            progress.addEventListener('click', function (event) {
                if (_this.uiStatus == 'unfocus') return;
                event.stopPropagation();

                var _progress$getBounding = progress.getBoundingClientRect(),
                    left = _progress$getBounding.left;

                _this.domAudio.currentTime = _this.domAudio.duration * (event.clientX - left) / progress.clientWidth;
                _this.renderVisualizer();
            });

            var progressInner = document.createElement('DIV');
            progressInner.style.height = '100%';
            progressInner.style.backgroundColor = 'white';
            progress.appendChild(progressInner);

            var visualizer = document.createElement('DIV');
            visualizer.classList.add('visualizer');

            var playListButton = document.createElement('I');
            playListButton.className = 'fa fa-list-ul navButton';
            playListButton.setAttribute('aria-hidden', 'true');
            playListButton.style.position = 'absolute';
            playListButton.style.bottom = '3%';
            playListButton.style.right = '3%';
            playListButton.style.fontSize = '1.2em';
            playListButton.style.color = 'white';
            playListButton.addEventListener('click', function (event) {
                if (_this.uiStatus == 'unfocus') return;
                event.stopPropagation();
                container.classList.add('outside-left');
                playList.classList.remove('outside-right');
            });

            // Overlay for album cover, for bluring and darking
            var overlay = document.createElement('DIV');
            overlay.classList.add('cover');
            overlay.style.zIndex = '1';

            // Album cover.
            var cover = document.createElement('DIV');
            cover.classList.add('cover');
            cover.style.zIndex = '0';

            var legacyCover = document.createElement('DIV');
            legacyCover.style.zIndex = '-1';
            legacyCover.classList.add('cover');
            legacyCover.innerHTML = ['<svg x="0px" y="0px" viewBox="0 0 489.164 489.164" style="width: 50%; height: 50%; padding-left: 25%; padding-top: 25%">', '<path d="M159.582,75.459v285.32c-14.274-10.374-32.573-16.616-52.5-16.616c-45.491,0-82.5,32.523-82.5,72.5s37.009,72.5,82.5,72.5', '	s82.5-32.523,82.5-72.5V168.942l245-60.615v184.416c-14.274-10.374-32.573-16.616-52.5-16.616c-45.491,0-82.5,32.523-82.5,72.5', '	s37.009,72.5,82.5,72.5s82.5-32.523,82.5-72.5V0L159.582,75.459z"/>', '<g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g>', '</svg>'].join('\n');
            legacyCover.style.backgroundColor = 'white';

            var playList = document.createElement('DIV');
            playList.className = 'cover outside-right playlist';
            playList.style.backgroundColor = 'black';

            var headbar = document.createElement('DIV');
            headbar.className = 'headbar';

            var returnButton = document.createElement('I');
            returnButton.className = 'fa fa-chevron-left navButton';
            returnButton.setAttribute('aria-hidden', 'true');
            returnButton.style.position = 'absolute';
            returnButton.style.left = '3%';
            returnButton.style.fontSize = '1.2em';
            returnButton.style.lineHeight = '44px';
            returnButton.style.color = 'white';
            returnButton.addEventListener('click', function (event) {
                if (_this.uiStatus == 'unfocus') return;
                event.stopPropagation();
                container.classList.remove('outside-left');
                playList.classList.add('outside-right');
            });

            var titleText = document.createElement('SPAN');
            titleText.style.lineHeight = '44px';
            titleText.innerHTML = '播放列表';

            headbar.appendChild(returnButton);
            headbar.appendChild(titleText);

            playList.appendChild(headbar);

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.playList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var song = _step.value;

                    var item = document.createElement('DIV');
                    item.className = 'list';

                    var face = document.createElement('DIV');
                    face.className = 'face';
                    face.style.backgroundImage = 'url(\'' + song.cover + '\')';

                    var title = document.createElement('DIV');
                    title.className = 'title';
                    title.innerHTML = song.title;

                    item.appendChild(face);
                    item.appendChild(title);

                    playList.appendChild(item);
                }

                // Append all elements to their parent elements.
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            mediainfo.appendChild(songArtist);
            mediainfo.appendChild(songTitle);
            mediainfo.appendChild(lyrics);
            container.appendChild(mediainfo);
            controls.appendChild(prevButton);
            controls.appendChild(playButton);
            controls.appendChild(nextButton);
            controller.appendChild(controls);
            if (this.showProgressBar) controller.appendChild(progress);
            controller.appendChild(visualizer);
            controller.appendChild(playListButton);
            container.appendChild(controller);
            container.appendChild(overlay);
            container.appendChild(cover);
            container.appendChild(legacyCover);

            this.element.appendChild(container);
            this.element.appendChild(playList);

            // Fix some style issue.
            songTitle.style.minWidth = this.element.clientWidth + 'px';
            if (this.element.clientWidth < songTitle.clientWidth) {
                (function () {
                    // We do not hope that the overflow part is really hidden. Fix it.
                    var actualWidth = songTitle.clientWidth;
                    var mleft = 0;
                    songTitle.innerText = songTitle.innerText + '    ' + songTitle.innerText;
                    var renderMarq = function renderMarq() {
                        songTitle.style.marginLeft = mleft + 'px';
                        mleft -= 1;
                        if (mleft + actualWidth <= 0) {
                            mleft = 0;
                        }
                    };
                    _this.intervals.songTitleMarq = setInterval(renderMarq, 20);
                })();
            }

            // Switching from showing controllers, mediainfo, visualizer or not.
            container.addEventListener('click', function (event) {
                if (_this.uiStatus == 'unfocus') {
                    if (_this.enableBlur) [cover, legacyCover].forEach(function (elem) {
                        return elem.classList.add('blur');
                    });

                    [playButton, prevButton, nextButton, progress].forEach(function (elem) {
                        elem.classList.add('pointer');
                    });
                    overlay.style.backgroundColor = 'rgba(0, 0, 0, .5)';
                    [mediainfo, controller].forEach(function (elem) {
                        elem.classList.remove('hidden');
                    });

                    _this.uiStatus = 'focus';
                } else {
                    if (_this.enableBlur) [cover, legacyCover].forEach(function (elem) {
                        return elem.classList.remove('blur');
                    });

                    [playButton, prevButton, nextButton, progress].forEach(function (elem) {
                        elem.classList.remove('pointer');
                    });
                    overlay.style.backgroundColor = '';
                    [mediainfo, controller].forEach(function (elem) {
                        elem.classList.add('hidden');
                    });

                    _this.uiStatus = 'unfocus';
                }
            });
            // Save some useful elements to our player's object.
            this.visualNode = visualizer;
            this.lrcNode = lyrics;
            this.progressBar = progressInner;

            // Save all the elements for further use.
            this.uiCollection = {
                container: container,
                mediainfo: mediainfo,
                songTitle: songTitle,
                songArtist: songArtist,
                lyrics: lyrics,
                controller: controller,
                controls: controls,
                playButton: playButton,
                nextButton: nextButton,
                prevButton: prevButton,
                progress: progress,
                progressInner: progressInner,
                visualizer: visualizer,
                overlay: overlay,
                cover: cover,
                legacyCover: legacyCover
            };
        }
    }, {
        key: 'initAudio',
        value: function initAudio() {
            var _this2 = this;

            // The <audio> element.
            this.domAudio = document.createElement('AUDIO');
            this.domAudio.crossOrigin = 'anonymous';
            this.element.appendChild(this.domAudio);
            // Variables and others needed by HTML Audio API.
            try {
                this.audio = {};
                this.audio.ctx = new AudioContext();
                this.audio.source = this.audio.ctx.createMediaElementSource(this.domAudio);
                this.audio.analyser = this.audio.ctx.createAnalyser();
                this.audio.analyser.fftSize = this.fftSize ? this.fftSize : this.audio.analyser.fftSize;
                this.audio.source.connect(this.audio.analyser);
                this.audio.source.connect(this.audio.ctx.destination);
                this.freq = new Uint8Array(this.audio.analyser.frequencyBinCount);
            } catch (ex) {
                this.audio = null;
                console.log('Failed on initAudio'); // doing nothing on unsupported browsers.
            }
            this.domAudio.addEventListener('ended', function () {
                _this2.nextTrack();
            });
        }
    }, {
        key: 'initLyrics',
        value: function initLyrics() {
            var _this3 = this;

            if (!this.showLyrics) {
                return;
            }

            // We need this function to be an arrow function, as we need the this of 
            // the whole class but not HTMLAudioElement.
            // Also, the reason for not using anonymous lambda function is that 
            // cleatInterval would treat them as different event handler.
            this.updateLyrics = function () {
                try {
                    var currentOffset = _this3.domAudio.currentTime * 1000;
                    var lastLines = _this3.lyrics.lines;

                    if (_this3.lyrics.table.length == _this3.lyrics.lines) clearInterval(_this3.intervals.lyrics);
                    while (_this3.lyrics.table[_this3.lyrics.lines - 1] && _this3.lyrics.table[_this3.lyrics.lines - 1].offset > currentOffset) {
                        _this3.lyrics.lines--;
                    }
                    while (_this3.lyrics.table[_this3.lyrics.lines].offset <= currentOffset) {
                        _this3.lrcNode.innerText = _this3.lyrics.table[_this3.lyrics.lines].lyric;
                        _this3.lyrics.lines++;
                    }
                } catch (e) {
                    clearInterval(_this3.intervals.lyrics);
                }
            };
            if (!this.nowPlaying.lrc) {
                if (this.lyrics.hasListener) {
                    this.domAudio.removeEventListener('seeking', this.updateLyrics);
                }
                // No lyric found, no need to go further.
                this.lyrics = {};
                this.lrcNode.innerText = '♪～(￣ε￣)';
                return;
            }
            // Storage the parsed lyrics.
            this.lyrics.table = [];
            // Part of lines with undefined content.
            var pending = [];
            this.nowPlaying.lrc.split('[').forEach(function (item, off) {
                _this3.nowPlaying.lrcOffset = _this3.nowPlaying.lrcOffset ? _this3.nowPlaying.lrcOffset : 0;
                // item -> [%d:%d.%d]%s
                //          1  2  3  4
                var f = function f(res) {
                    return (res[1] * 60 + res[2] * 1) * 1000 + res[3].substr(0, 2) * 10 + _this3.nowPlaying.lrcOffset;
                };

                if (item == '') // Ignore the empty lines.
                    return;
                if (item[0] != '[') // Recover the line.
                    item = '[' + item;

                var lyric = item.match(/\[(\d+):(\d+).(\d+)\](.*)/);
                if (lyric[4] == '') {
                    // Content unedfined, push current offset into pending list.
                    pending.push(off);
                    var _offset = f(lyric);
                    _this3.lyrics.table.push({
                        offset: _offset,
                        lyric: ''
                    });
                    return;
                }
                var offset = f(lyric);
                _this3.lyrics.table.push({ // Pushing parsed result into the lyrics table.
                    offset: offset,
                    lyric: lyric[4]
                });
                while (pending.length > 0) {
                    // Filling the lines which content is undefined.
                    var _off = pending.shift() - 1;
                    _this3.lyrics.table[_off].lyric = lyric[4];
                }
            });
            this.lyrics.table.sort(function (a, b) {
                // Sort the table by offset.
                return a.offset - b.offset;
            });
            if (!this.lyrics.hasListener) {
                this.domAudio.addEventListener('seeking', this.updateLyrics);
                this.lyrics.hasListener = true;
            }
            this.lyrics.lines = 0;
        }
    }, {
        key: 'updateBar',
        value: function updateBar(offset, value) {
            var bar = this.barArray[offset];
            if (!bar) return;

            // Converts a number to a percentage
            value /= 2.56;

            // Only in the drop
            var prevValue = bar.style.height.substring(0, bar.style.height.length - 1);
            prevValue = parseFloat(prevValue);
            if (value < prevValue) {
                var dist = prevValue - value;
                value += dist * (1 - this.dropRate);
            }
            bar.style.height = value + '%';
        }
    }, {
        key: 'renderVisualizer',
        value: function renderVisualizer() {
            if (this.showProgressBar) this.progressBar.style.width = 100 * Math.min(this.domAudio.currentTime / this.domAudio.duration, 1) + '%';
            if (!this.showVisualizer || this.audio === null) return;
            this.audio.analyser.getByteFrequencyData(this.freq);

            if (this.domAudio.paused) return;

            if (this.logarithmic) {
                for (var i = 0; i != this.barCount; ++i) {
                    var sum = 0,
                        cnt = 0;
                    var width = Math.log(this.audio.analyser.frequencyBinCount) / this.barCount;

                    for (var j = Math.exp((i - 1) * width); j <= Math.exp(i * width); ++j) {
                        sum += this.freq[Math.ceil(j)];
                        cnt++;
                    }
                    var value = sum / cnt;
                    this.updateBar(i, value);
                }
            } else {
                var _width = (this.linearRegion[1] - this.linearRegion[0]) * this.audio.analyser.frequencyBinCount;
                for (var _i = 0; _i < this.barCount; ++_i) {
                    var _sum = 0;
                    for (var _j = 0; _j < _width / this.barCount; ++_j) {
                        var offset = _i * (_width / this.barCount) + _j + this.audio.analyser.frequencyBinCount * this.linearRegion[0];
                        _sum += this.freq[Math.ceil(offset)];
                    }
                    var _value = _sum / (_width / this.barCount);
                    this.updateBar(_i, _value);
                }
            }
        }
    }, {
        key: 'flushStatus',
        value: function flushStatus() {
            if (this.domAudio.paused) {
                this.uiCollection.playButton.classList.remove('fa-pause');
                this.uiCollection.playButton.classList.add('fa-play');
            } else {
                this.uiCollection.playButton.classList.remove('fa-play');
                this.uiCollection.playButton.classList.add('fa-pause');
            }
        }
    }, {
        key: 'play',
        value: function play() {
            var _this4 = this;

            this.initLyrics();
            this.intervals.lyrics = setInterval(function () {
                _this4.updateLyrics();
            }, 20);
            this.intervals.visualizer = setInterval(function () {
                _this4.renderVisualizer();
            }, 17);
            this.domAudio.play();
            this.flushStatus();
        }
    }, {
        key: 'pause',
        value: function pause() {
            clearInterval(this.intervals.lyrics);
            clearInterval(this.intervals.visualizer);
            this.domAudio.pause();
            this.flushStatus();
        }
    }, {
        key: 'nextTrack',
        value: function nextTrack() {
            this.pause();
            this.currentTrack++;
            this.currentTrack %= this.playList.length;
            this.reinit();
            this.play();
        }
    }, {
        key: 'prevTrack',
        value: function prevTrack() {
            this.currentTrack--;
            if (this.currentTrack < 0) this.currentTrack += this.playList.length;
            this.currentTrack %= this.playList.length;
            this.reinit();
            this.play();
        }
    }, {
        key: 'reinit',
        value: function reinit() {
            var _this5 = this;

            // UI part
            this.uiCollection.songTitle.innerHTML = this.nowPlaying.title ? this.nowPlaying.title : '未知歌曲';
            this.uiCollection.songArtist.innerHTML = this.nowPlaying.artist ? this.nowPlaying.artist : '未知艺术家';
            this.uiCollection.progressInner.style.width = '0';
            if (this.nowPlaying.cover) {
                this.uiCollection.cover.style.backgroundImage = 'url(\'' + this.nowPlaying.cover + '\')';
                this.uiCollection.cover.style.backgroundSize = 'cover';
            } else {
                this.uiCollection.cover.style.backgroundSize = '50%';
                //this.uiCollection.cover.style.backgroundImage = `url('default.svg')`;
                this.uiCollection.cover.style.backgroundRepeat = 'no-repeat';
                this.uiCollection.cover.style.backgroundPosition = 'center';
            }

            // Audio part
            this.domAudio.src = this.nowPlaying.url;

            // Lyrics
            this.initLyrics();

            clearInterval(this.intervals.songTitleMarq);
            this.uiCollection.songTitle.style.marginLeft = '';
            if (this.element.clientWidth < this.uiCollection.songTitle.clientWidth) {
                (function () {
                    // We do not hope that the overflow part is really hidden. Fix it.
                    var songTitle = _this5.uiCollection.songTitle;
                    songTitle.innerText = songTitle.innerText + '        ';
                    var actualWidth = songTitle.clientWidth;
                    var mleft = 40;
                    songTitle.innerText = songTitle.innerText + songTitle.innerText;
                    var renderMarq = function renderMarq() {
                        if (mleft < 0) songTitle.style.marginLeft = mleft + 'px';
                        mleft -= 0.5;
                        if (mleft + actualWidth <= 0) {
                            mleft = 40;
                        }
                    };
                    _this5.intervals.songTitleMarq = setInterval(renderMarq, 20);
                })();
            }

            // Clear the remaining lyric.
            this.lrcNode.innerHTML = '';
        }
    }, {
        key: 'nowPlaying',
        get: function get() {
            return this.playList[this.currentTrack];
        }
    }]);

    function Player(params) {
        _classCallCheck(this, Player);

        // Load all the preferences.
        this.element = params.parent;
        this.style = params.style || {};
        this.playList = params.playList;
        this.barCount = params.maxBars ? params.maxBars : 128;
        this.logarithmic = params.logarithmic ? params.logarithmic : false;
        this.fftSize = params.fftSize;
        this.autoStart = params.autoStart ? params.autoStart : false;
        this.showVisualizer = params.showVisualizer ? params.showVisualizer : true;
        this.showProgressBar = params.showProgressBar ? params.showProgressBar : true;;
        this.enableBlur = typeof params.enableBlur !== 'undefined' ? params.enableBlur : true;
        this.showLyrics = params.showLyrics ? params.showLyrics : false;
        this.dropRate = typeof params.dropRate !== 'undefined' ? params.dropRate : 1;
        this.linearRegion = params.linearRegion ? params.linearRegion : [0, 1];

        // Initialize some global variables
        this.currentTrack = 0;
        this.intervals = {};
        this.lyrics = {};

        // Initialize components.
        this.initUI();
        this.initAudio();
        this.initLyrics();
        this.initVisualizer();
        this.reinit(); // Immediate fill the data of now playing song.

        // let's rock and roll.
        if (this.autoStart) this.play();
    }

    _createClass(Player, [{
        key: 'initVisualizer',
        value: function initVisualizer() {
            if (!this.showVisualizer || this.audio === null) return;
            this.barArray = [];
            this.visualNode.innerHTML = "";
            var barWidth = this.visualNode.clientWidth / this.barCount;
            for (var i = 0; i != this.barCount; ++i) {
                var newBar = document.createElement('DIV');
                newBar.style.width = barWidth + 'px';
                newBar.style.marginLeft = i * barWidth + 1 + 'px';
                newBar.style.bottom = '0';
                newBar.style.position = 'absolute';
                newBar.style.display = 'inline-block';
                // newBar.style.borderTop = 'solid 1px white';
                newBar.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                newBar.id = 'bar' + i;
                this.visualNode.appendChild(newBar);
                this.barArray.push(newBar);
            }
        }
    }]);

    return Player;
}();
