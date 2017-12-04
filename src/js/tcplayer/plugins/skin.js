import videojs from '../../video.js';
import '../components/skin/big-play-button.js';
import '../components/skin/loading-spinner.js';

const Plugin = videojs.getPlugin('plugin');
class Skin extends Plugin{
  constructor(player, options) {
    super(player);
    console.log('new Skin', this, options);
    this.player.addClass('tcp-skin');
  }
}

videojs.registerPlugin('Skin', Skin);
export default Skin;
