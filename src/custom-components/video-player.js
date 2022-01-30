import React from 'react';
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import CustomModal from './internal-components/modal';
import VideoSkip from './videojs-components/video-skip';
import SubtitlesMenu from './internal-components/subtitles-menu';

const ipc = window.require('electron').ipcRenderer;
const path = window.require('path');
export default class VideoPlayer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      subtitlesPath: '',
      showSettings: false,
      playing: false,
      sleeperId: null,
      settings: {
        skipAmount: 8,
        autoSleepEnable: false,
        autoSleepAmount: 30,
      },
      showSubtitleSettings: false,
    }
  }
  registerShortcuts = () => {
    const shortcutList = {
      'F': () => this.skip('forward'),
      'B': () => this.skip('backward'),
      'P': () => this.togglePlay(),
      'K': () => this.enterFullScreen(),
      ' ': () => this.togglePlay()
    };
    window.addEventListener('keyup', (e) => {
      Object.entries(shortcutList).forEach((shortcut) => {
        if(e.key.toLowerCase() === shortcut[0].toLowerCase()) {
          shortcut[1]();
        }
      })
    })
  }
  enterFullScreen = () => {
    document.getElementsByClassName('vjs-fullscreen-control')[0].click();
  }
  componentDidMount() {
    // instantiate Video.js
    let props = {...this.props};
    this.player = videojs(this.videoNode, props, function onPlayerReady() {
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
    this.registerShortcuts();
    const el = document.getElementsByClassName('vjs-text-track-display')[0];
    setTimeout(() => console.log(el.children), 2000);
    // el.firstElementChild.id = 'subtitle-container';
    // this.observeTextTrackChanges();
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
  showSubtitlesMenu = (event) => {
    event.preventDefault();
    event.stopPropagation()
    console.log('Event Trigerred');
    this.setState({
      showSubtitleSettings: true
    }, ()=> {
      const menu = document.querySelector('.ctxmenu');
      menu.style.top = event.y + 'px';
      menu.style.left = event.x + 'px';
    })
    
  } 
  setSubtitles = (e, path) => {
    this.setState({
      subtitlesPath: path
    })
  }
  skip = (type) => {
    this.player.currentTime(this.player.currentTime() + (type === 'forward' ? 1 : -1) * this.state.settings.skipAmount );
  }
  observeTextTrackChanges = () => {
    let elem = document.getElementById('subtitle-container');
    console.log(elem);
    let changeFn = function() {
      console.log(arguments);
    };
    const mutOb = new MutationObserver(changeFn);
    mutOb.observe(elem, { 
      childList: true,
      attributeFilter: []
    });
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
        this.setState({
          playing: true
        })
      }
      // this.player.load();
    }
    if(prevProps.settingsObj !== this.props.settingsObj) {
      this.setState({
        settings: this.props.settingsObj
      }, () => {
        if (this.props.settingsObj.autoSleepEnable) {
          this.startAutoSleep();
        }
      })    
      
    }
    if(prevState.subtitlesPath !== this.state.subtitlesPath) {
      this.trackElem = this.player.addRemoteTextTrack({src: this.state.subtitlesPath,
      label: path.basename(this.state.subtitlesPath)});
      console.log(this.player.textTracks());
      this.player.on('texttrackchange',  () => {
        let activeCues = this.player.textTracks().tracks_[0].activeCues_;
        activeCues.forEach((elem) => {
          elem.displayState.style.pointerEvents = "auto";
          elem.displayState.style.pointer = "text"
          elem.displayState.addEventListener('contextmenu', (e) => this.showSubtitlesMenu(e));
        })
      })
      // this.player.textTracks().tracks_.cues_[0].endTime = 50
      setTimeout(() => {
        // this.player.textTracks().tracks_[0].cues_[0].endTime = 50;
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
  togglePlay = () => {
    if (this.state.playing) {
      this.player.pause();
    } else {
      this.player.play();
    }
    this.setState((state) => ({
      playing: !state.playing
    }))
  }

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
  setSettingValue = (property, value) => {
    if (!isNaN(value)) {
      this.setState((state) => ({
        settings: {
          ...state.settings,
          [property]: Math.max(value, 0)
        }
      }))
    }
  }
  setSkipAmount = (value) => {
    if (!isNaN(value)) {
      this.setState((state) => ({
        settings: {
          ...state.settings,
          skipAmount: Math.max(value, 0)
        }
      }))
    }
  }
  onSettingsSubmit = () => {
    ipc.send('settings-receiver-web', this.state.settings);
    this.setState({
      showSettings: false
    });
    this.toggleAutoSleep();
  }

  startAutoSleep = () => {
    const sleeperId = setInterval(() => {
      this.player.pause();
      this.setState({
        playing: false
      })
    }, this.state.settings.autoSleepAmount * 60 * 1000);
    this.setState({sleeperId: sleeperId});
  }

  toggleAutoSleep = () => {
    const autoSleepEnabled = this.state.settings.autoSleepEnable;
    if (autoSleepEnabled) {
      this.startAutoSleep();
    } else {
      const currSleeperId = this.state.sleeperId;
      if (currSleeperId) {
        clearInterval(currSleeperId);
      }
    }
  }
  showMeaning = (text) => {
    const ud = window.require('urban-dictionary');
    ud.define(text, (error, results) => {console.log(results)})
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
                <div className='grid-container'>
                  <div className='settings-text'>Skip Amount (in seconds)</div>
                  <div className='d-flex flex-row space-evenly align-center rg-10'>
                    <button className='square-button' onClick={() => this.setSettingValue('skipAmount', this.state.settings.skipAmount + 1)}>+</button>
                    <input type={'tel'} pattern="[0-9]+" className='input-box' value={this.state.settings.skipAmount}
                      onChange={(value) => this.setSettingValue('skipAmount', this.state.settings.skipAmount + 1)}
                    />
                    <button className='square-button' onClick={() => this.setSettingValue('skipAmount', this.state.settings.skipAmount - 1)}>-</button>
                  </div>
                  <div className='settings-text'>Enable Auto Sleep</div>
                  <input type="checkbox" onChange={() => this.setState((state) => ({
                    settings: {
                      ...state.settings,
                      autoSleepEnable: !state.settings.autoSleepEnable
                    }
                  }))} checked={this.state.settings.autoSleepEnable}></input>
                  <div className={'settings-text' + (!this.state.settings.autoSleepEnable ? ' disabled' : '')}>Auto Sleep Amount (in minutes)</div>
                  <div className={'d-flex flex-row space-evenly align-center' + (!this.state.settings.autoSleepEnable ? ' disabled' : '')}>
                    <button className='square-button' onClick={() => this.setSettingValue('autoSleepAmount', this.state.settings.autoSleepAmount + 1)}>+</button>
                    <input type={'tel'} pattern="[0-9]+" className='input-box' value={this.state.settings.autoSleepAmount}
                      onChange={(value) => this.setSettingValue('autoSleepAmount', this.state.settings.autoSleepAmount + 1)}
                    />
                    <button className='square-button' onClick={() => this.setSettingValue('autoSleepAmount', this.state.settings.autoSleepAmount - 1)}>-</button>
                  </div>
                </div>
              </div>
          </CustomModal.Body>
          <CustomModal.Footer>
            <button className='submit-button' onClick={this.onSettingsSubmit}>SUBMIT</button>
          </CustomModal.Footer>
        </CustomModal>
        {this.state.showSubtitleSettings && <SubtitlesMenu 
          menuItems={[
            {
              label: 'Get Meaning',
              onClick: () => this.showMeaning(window.getSelection().toString()),
            }
          ]}
          onClickOutside={() => { console.log('Outside Click Triggered'); this.setState({showSubtitleSettings: false}) }}
        />}
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