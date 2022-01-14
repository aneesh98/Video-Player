import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import './test.css'
import '@fortawesome/fontawesome-free/css/all.css';
var Component = videojs.getComponent('Component')
class VideoSkip extends Component {
    constructor(player, options) {
        super(player, options);
        if (options.icon) {
            this.setIcon(options.icon);
        }
    }
    createEl() {
        return videojs.createEl(
            'i', {
                className: 'fas fa-2x pos'
            }
        )
    }
    setIcon(icon) {
        this.el().classList.add('fa-' + icon);
    }
    skipForward() {
        this.player.currentTime(this.player.currentTime() + 10);
    }
}
Component.registerComponent('VideoSkip', VideoSkip);
export default VideoSkip;

