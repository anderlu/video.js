/**
 * User: Anderlu
 * Date: 2017/9/12
 * Time: 下午11:20
 */
import videojs from '../video.js';
import window from 'global/window';

import './plugins/dvr.js';
import resourceLoader from './utils/resource-loader';

window.videojs = videojs;

// resourceLoader('../../../dist/video-js.css', {
//   success: function () {
//     console.log('load css done');
//   }
// });

function TcPlayer(id, options, ready) {
  // TODO
  options.plugins = videojs.mergeOptions(options.plugins, {
    'Dvr':{}
  });
  console.log(options);
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
