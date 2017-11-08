/**
 * User: Anderlu
 * Date: 2017/9/12
 * Time: 下午11:20
 */
import videojs from '../video.js';
//引入自定义模块
import './plugins/dvr.js';
import './plugins/quality-switcher.js';
import './tech/hlsjs.js';
import './tech/flash/flash.js';
import './tech/flash/flashls.js';
import './components/skin/skin.js';
import CN from  '../../../lang/zh-CN.json';

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
  var plugins = {
  };
  options.plugins = videojs.mergeOptions(options.plugins, plugins);
  options.language = options.language || 'zh-CN';

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
