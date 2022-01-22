import logo from './logo.svg';
import './App.css';
import FormButton from './custom-components/input-button';
import SimpleMenu from './custom-components/simple-menu';
import { Component, useEffect, useState } from 'react';
import VideoPlayer from './custom-components/video-player';
import { useVideoSrc } from './custom-components/context';
const ipc = window.require('electron').ipcRenderer;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      videoSrc: null,
      settings: {}
    }
  }
  setVideoOptions = (e, path) => {
    this.setState((state) => ({
      videoSrc: path
    }))
  }
  componentDidMount() {
    ipc.on('selected-file', this.setVideoOptions);
    ipc.on('settings-receiver', this.setSettings)
  }
  setSettings = (e, value) => {
    this.setState({
      settings: value
    })
  }
  componentWillUnmount() {
    ipc.removeAllListeners();
  }
  render() {
    const type = (this.state.videoSrc) ? this.state.videoSrc.split('.').at(-1) : '';

    const sourceList = (this.state.videoSrc) ? [{
      src: this.state.videoSrc,
        type: 'video/' + (type === 'mkv' ? 'webm' : type)
    }] : [];
    const videoOptions = {
      autoplay: true,
      controls: true,
      sources: sourceList,
      children: ['mediaLoader',
      'posterImage',
      'textTrackDisplay',
      'loadingSpinner',
      'bigPlayButton',
      'liveTracker',
      'controlBar',
      'errorDisplay',
      'textTrackSettings',
      'resizeManager'],
      settingsObj: this.state.settings
    }
    return (
      <div className="App">
        <VideoPlayer {...videoOptions}/>
    </div>
    )
  }
}

// function App() {
//   const [videoOptions, setVideoOptions] = useState(null);
//   console.log(videoSrc);
//   useEffect(() => {
//     const newVideoOptions = {
//       autoplay: true,
//       controls: true,
//       sources: [{
//         src: 'http://localhost:3000/'+videoSrc.split('/').at(-1),
//         type: 'video/' + videoSrc.split('.').at(-1)
//       }]
//     };
//     setVideoOptions(newVideoOptions)
//   }, [videoSrc])
//   return (
//     <div className="App">
//       <SimpleMenu>
//         <FormButton label="Play Video" type="upload" onUpload={() => {
//           console.log(document.getElementById('file-node'))
//         }}/>
//       </SimpleMenu>
//       <VideoPlayer {...videoOptions} />
//     </div>
//   );
// }

export default App;
