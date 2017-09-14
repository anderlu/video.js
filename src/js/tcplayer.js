/**
 * User: Anderlu
 * Date: 2017/9/12
 * Time: 下午11:20
 */
import videojs from './video.js';
import resourceLoader from './utils/resource-loader.js';

function TcPlayer(id, options, ready) {
  // TODO
  resourceLoader();
  const player = videojs(id, options, ready);

  return player;
}
TcPlayer.videojs = videojs;
// Object.assign(TcPlayer, videojs);

export default TcPlayer;
