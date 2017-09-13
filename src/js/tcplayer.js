/**
 * User: Anderlu
 * Date: 2017/9/12
 * Time: 下午11:20
 */
import videojs from './video.js';

function TcPlayer(id, options, ready) {
  // wrap
  const player = videojs(id, options, ready);

  return player;
}

Object.assign(TcPlayer, videojs);

export default TcPlayer;
