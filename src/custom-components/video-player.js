import React from 'react';
import videojs from 'video.js'
import 'video.js/dist/video-js.css'

export default class VideoPlayer extends React.Component {
  componentDidMount() {
    // instantiate Video.js
    this.player = videojs(this.videoNode, this.props, function onPlayerReady() {
        console.log('onPlayerReady', this)
      })
    console.dir(this.player);
    console.dir(this.videoNode)
  }
  componentDidUpdate(prevProps) {
    console.log(this.props);
    if(prevProps !== this.props) {
      this.player.src({
        type: this.props.sources[0].type,
        src: this.props.sources[0].src
      })
      console.dir(this.player);
      // this.player.load();
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