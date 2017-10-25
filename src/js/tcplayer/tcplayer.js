/**
 * User: Anderlu
 * Date: 2017/9/12
 * Time: 下午11:20
 */
import videojs from '../video.js';

import './plugins/dvr.js';
import './tech/hlsjs.js';
import CN from  '../../../lang/zh-CN.json';

// import resourceLoader from './utils/resource-loader';

window.videojs = videojs;

// resourceLoader('../../../dist/video-js.css', {
//   success: function () {
//     console.log('load css done');
//   }
// });
videojs.addLanguage('zh-CN', CN);
function TcPlayer(id, options, ready) {
  // TODO
  var plugins = {
    'Dvr': {}
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
