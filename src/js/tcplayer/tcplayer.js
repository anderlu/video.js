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
  videojs.dom.addClass(document.querySelector('#'+id),'video-js');
  // TODO
  let defaultOptions = {
    controls: true,
    language: 'zh-CN',
    playbackRates: [0.5, 1, 1.25, 1.5, 2],
    controlBar:{
      volumePanel:{
        inline:false
      }
    },
    plugins: {
      Skin:'',
      VID: '',
      QualitySwitcher: {},
      MultiResolution: {},
      Errors:{}
    }
  };
  // 默认开启的插件,有顺序要求，VID>QualitySwitcher>MultiResolution
  var plugins = {
    Skin:'',
    VID: '',
    QualitySwitcher: {},
    MultiResolution: {},
    Errors:{}
  };
  if (options) {
    // options.plugins = videojs.mergeOptions(plugins, options.plugins);
    options.playbackRates = options.playbackRates ? defaultOptions.playbackRates : false;
    options = videojs.mergeOptions(defaultOptions, options);
    console.log(options);
  }
  // logoImage 在player的Children中有顺序要求，需在封面之前初始化，通常情况下需要plugin来进行配置component的顺序，但是代码量较少，就在tcplayer处理。
  videojs.getComponent('player').prototype.options_.children.splice(1, 0, 'logoImage');

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
