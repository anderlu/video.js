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
    console.log('new VID', this, options);
    let sources = player.options_.sources;
    if(sources.length > 0){
      for(let i = 0; i < sources.length; i++){
        if(sources[i].appID && sources[i].fileID){
          player.options_.children[0] = 'MediaAsyncLoader';
        }
      }

    }
  }
  init() {

  }
  switchResloution(id){

  }
}

videojs.registerPlugin('VID', VID);

export default VID;
