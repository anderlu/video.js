import videojs from '../video.js';
//引入自定义模块
import './components/async-loader.js';
import './components/logo-image.js';
import './plugins/skin.js';
import './plugins/vid.js';
import './plugins/dvr.js';
import './plugins/quality-switcher.js';
import './plugins/multi-resolution.js';
import './plugins/errors.js';
import './tech/hlsjs.js';
import './tech/flash/flash.js';
import './tech/flash/flashls.js';
import CN from '../../../lang/zh-CN.json';

// import resourceLoader from './utils/resource-loader';

// resourceLoader('../../../dist/video-js.css', {
//   success: function () {
//     console.log('load css done');
//   }
// });

// window.videojs = videojs;
videojs.addLanguage('zh-CN', CN);

function TcPlayer(id, options, ready) {
  // TODO
  // 默认开启的插件,有顺序要求，VID>QualitySwitcher>MultiResolution
  var plugins = {
    Skin:'',
    VID: '',
    QualitySwitcher: {},
    MultiResolution: {},
    Errors:{}
  };
  if (options) {
    options.plugins = videojs.mergeOptions(plugins, options.plugins);
    console.log(options.plugins);
    options.language = options.language || 'zh-CN';
  }

  // var Player = videojs.getComponent('Player');
  // Player.prototype.options_.children[0] = '';

  const player = videojs(id, options, ready);

  return player;
}

// TcPlayer.videojs = videojs;
Object.assign(TcPlayer, videojs);

// class TcPlayer extends videojs{
//   constructor(id, options, ready) {
//     let player = super(id, options, ready);
//     // return player;
//   }
// }

export default TcPlayer;
