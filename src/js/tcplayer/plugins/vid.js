import videojs from '../../video.js';

const Plugin = videojs.getPlugin('plugin');
class VID extends Plugin{
  /**
   *
   * 用于支持传入fileid appid的sources，使用 async-loader 替换原有的 medialoader，在async-loader中异步获取视频地址等信息。
   * {@link async-loader.js}
   *　
   *
   */
  constructor(player, options) {
    super(player);
    // console.log('new VID', this, options);
    this.init(this.player.options_);
  }
  init(playerOptions) {
    let sources = playerOptions.sources;
    if(playerOptions && playerOptions.appID && playerOptions.fileID){
      // vid mode switch async loader
      playerOptions.children[0] = 'MediaAsyncLoader';
    }else if(sources.length>0){
      // url mode
    }else{
      console.warn('no video fileID or source');
    }
  }
}

videojs.registerPlugin('VID', VID);

export default VID;
