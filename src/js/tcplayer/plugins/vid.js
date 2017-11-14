import videojs from '../../video.js';

const Plugin = videojs.getPlugin('plugin');
class VID extends Plugin{
  /**
   *
   * 用于支持传入fileid appid的sources，使用 async-loader 替换原有的 medialoader，异步获取视频地址等信息。
   * {@link async-loader.js}
   *　
   *
   */
  constructor(player, options) {
    super(player);
    console.log('new VID', this, options);
    player.options_.children[0] = 'MediaAsyncLoader';
    let playerOptions = player.options_;
  }
  init() {

  }
  switchResloution(id){

  }
}

videojs.registerPlugin('VID', VID);

export default VID;
