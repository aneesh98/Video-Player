import React from 'react';
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import CustomModal from './internal-components/modal';
import VideoSkip from './videojs-components/video-skip';

const ipc = window.require('electron').ipcRenderer;

export default class VideoPlayer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      subtitlesPath: '',
      showSettings: false,
      settings: {
        skipAmount: 8
      }
    }
  }
  componentDidMount() {
    // instantiate Video.js
    this.player = videojs(this.videoNode, this.props, function onPlayerReady() {
      })
    const VideoSkip = videojs.getComponent('VideoSkip');
    const SkipCompForward = new VideoSkip(this.player, {
      icon: 'forward'
    });
    const SkipCompBackward = new VideoSkip(this.player, {
      icon: 'backward'
    });
    SkipCompForward.on('click', () => this.skip('forward'));
    SkipCompBackward.on('click', () => this.skip('backward'));
    
    this.player.controlBar.addChild(SkipCompForward);
    this.player.controlBar.addChild(SkipCompBackward);
    ipc.on('subtitle-listener', this.setSubtitles)
    ipc.on('settings-toggle', this.toggleSettings);
  }
  toggleSettings = (e, obj) => {
    this.setState((state) => ({
      showSettings: !state.showSettings
    }));
  }
  setSubtitles = (e, path) => {
    this.setState({
      subtitlesPath: path
    })
  }
  skip = (type) => {
    this.player.currentTime(this.player.currentTime() + (type === 'forward' ? 1 : -1) * this.state.settings.skipAmount );
  }
  componentDidUpdate(prevProps, prevState) {
    if(prevProps.sources !== this.props.sources) {
      if (this.props.sources.length > 0) {
        this.player.pause();
        this.player.src({
          type: this.props.sources[0].type,
          src: this.props.sources[0].src
        })
        this.player.currentTime(0);
        this.player.removeRemoteTextTrack();
        // this.player.reset();
        this.player.play();
      }
      // this.player.load();
    }
    if(prevProps.settingsObj !== this.props.settingsObj) {
      this.setState({
        settings: this.props.settingsObj
      })    
    }
    if(prevState.subtitlesPath !== this.state.subtitlesPath) {
      this.player.addRemoteTextTrack({src: this.state.subtitlesPath});
      // this.player.textTracks().tracks_.cues_[0].endTime = 50
      setTimeout(() => {
        this.player.textTracks().tracks_[0].cues_[0].endTime = 50;
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
  }
  
  onSettingsClose = () => {
    this.setState({
      showSettings: false
    })
  }
  setSkipAmount = (value) => {
    this.setState((state) => ({
      settings: {
        ...state.settings,
        skipAmount: Math.max(value, 0)
      }
    }))
  }
  onSettingsSubmit = () => {
    ipc.send('settings-receiver-web', this.state.settings);
  }

  // wrap the player in a div with a `data-vjs-player` attribute
  // so videojs won't create additional wrapper in the DOM
  // see https://github.com/videojs/video.js/pull/3856
  render() {
    return (
      <>
        <CustomModal display={this.state.showSettings} title="Settings" closable onClose={() => this.onSettingsClose()}>
          <CustomModal.Body>
              <div
                  style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'space-evenly',
                      height: 'inherit',
                  }}
              >
                <div className='d-flex flex-row space-evenly align-center rg-10'>
                  <div className='settings-text'>Skip Amount (in seconds)</div>
                  <button className='square-button' onClick={() => this.setSkipAmount(this.state.settings.skipAmount + 1)}>+</button>
                  <input type={'text'} className='input-box' value={this.state.settings.skipAmount}
                    onChange={(value) => this.setSkipAmount(value)}
                  />
                  <button className='square-button' onClick={() => this.setSkipAmount(this.state.settings.skipAmount - 1)}>-</button>
                </div>
              </div>
          </CustomModal.Body>
          <CustomModal.Footer>
            <button className='submit-button' onClick={this.onSettingsSubmit}>SUBMIT</button>
          </CustomModal.Footer>
        </CustomModal>
        <div style={{
          height: "100vh",
          width: "100%",
        }}>
          <div data-vjs-player >
              <video ref={ node => this.videoNode = node } className="video-js vjs-default-skin vjs-fill">
                
              </video>
          </div>
        </div>
      </>
    )
  }
}