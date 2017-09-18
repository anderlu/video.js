/**
 * User: Anderlu
 * Date: 2017/9/12
 * Time: 下午11:20
 */
import videojs from './video.js';
import window from 'global/window';

function TcPlayer(id, options, ready) {
  // TODO
  window.videojs = videojs;
  // resourceLoader('//unpkg.com/videojs-contrib-hls.js@3.0.3/dist/videojs-contrib-hlsjs.min.js', {
  //   success: function () {
  //     console.log('load hls done');
  //   }
  // });
  const player = videojs(id, options, ready);

  return player;
}
TcPlayer.videojs = videojs;
// Object.assign(TcPlayer, videojs);

export default TcPlayer;
