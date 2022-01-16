import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import './test.css'
import '@fortawesome/fontawesome-free/css/all.css';
var Component = videojs.getComponent('Component')
var ClickableComponent = videojs.getComponent('ClickableComponent')
class VideoSkip extends ClickableComponent {
    constructor(player, options) {
        super(player, options);
        if (options.icon) {
            this.setIcon(options.icon);
        }
    }
    createEl() {
        return videojs.createEl(
            'i', {
                className: 'fas fa-lg pos'
            }
        )
    }
    setIcon(icon) {
        this.el().classList.add('fa-' + icon);
        this.el().appendChild(videojs.createEl('span', {
            className: 'vjs-icon-placeholder'
          }, {
            'aria-hidden': true
          }));
      
        this.createControlTextEl(this.el());
        this.controlText('Skip ' + (icon === 'forward' ? 'Forward' : 'Backward'))
    }
    skipForward() {
        this.player.currentTime(this.player.currentTime() + 10);
    }
}
Component.registerComponent('VideoSkip', VideoSkip);
export default VideoSkip;

