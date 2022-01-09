import React from 'react';
import videojs from 'video.js'
import 'video.js/dist/video-js.css'

const ipc = window.require('electron').ipcRenderer;

export default class VideoPlayer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      subtitlesPath: '',
    }
  }
  componentDidMount() {
    // instantiate Video.js
    console.log('ComponentDidMount called');
    this.player = videojs(this.videoNode, this.props, function onPlayerReady() {
        console.log('onPlayerReady', this)
      })
    ipc.on('subtitle-listener', this.setSubtitles)
  }
  setSubtitles = (e, path) => {
    console.log('[setSubtitles], causing state update');
    this.setState({
      subtitlesPath: path
    })
  }
  componentDidUpdate(prevProps, prevState) {
    console.log(this.props);
    if(prevProps !== this.props) {
      this.player.src({
        type: this.props.sources[0].type,
        src: this.props.sources[0].src
      })
      console.dir(this.player);
      this.player.removeRemoteTextTrack();
      // this.player.load();
    }
    if(prevState.subtitlesPath !== this.state.subtitlesPath) {
      console.log('Calling CDU for state change');
      this.player.addRemoteTextTrack({src: this.state.subtitlesPath});
      // this.player.textTracks().tracks_.cues_[0].endTime = 50
      setTimeout(() => {
        this.player.textTracks().tracks_[0].cues_[0].endTime = 50;
        console.log(this.player.textTracks().tracks_[0].cues_[0]);
      }, 3000)
      // this.player.addRemoteTextTrack({src: this.state.subtitlesPath})
    }
  }
  // componentDidUpdate(prevProps) {
  //   console.log('Update Fired', prevProps, this.props);
  //   if (prevProps !== this.props) {
  //     this.setState({player : videojs(this.videoNode, this.props, function onPlayerReady() {
  //       console.log('onPlayerReady', this)
  //     })})
  //   }
  // }
  // destroy player on unmount
  componentWillUnmount() {
    if (this.player) {
      this.player.dispose()
    }
    ipc.removeAllListeners();
    console.log('[UNMOUNT] VideoPlayer');
  }
  

  // wrap the player in a div with a `data-vjs-player` attribute
  // so videojs won't create additional wrapper in the DOM
  // see https://github.com/videojs/video.js/pull/3856
  render() {
    return (
      <div style={{
        height: "100vh",
        width: "100%",
      }}>
        <div data-vjs-player >
            <video ref={ node => this.videoNode = node } className="video-js vjs-default-skin vjs-fill">
              
            </video>
        </div>
      </div>
    )
  }
}