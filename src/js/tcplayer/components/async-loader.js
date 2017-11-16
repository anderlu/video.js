/**
 * @file loader.js
 */
import Component from '../../component.js';
import mergeOptions from '../../utils/merge-options.js';
import log from '../../utils/log.js';
import { getFileExtension, isCrossOrigin } from '../../utils/url.js';
import * as Constant from '../constant.js';
import jsonp from '../utils/jsonp.js';

/**
 * 可以检测当前播放环境，分析传入的视频格式，
 * 可以异步加载需要的播放组件例如 hls.js、flv.js 等，
 *
 * MediaAsyncLoader 用于替代loader.js的逻辑
 * when a player is initialized.
 *
 * 无防盗链
 * https://playvideo.qcloud.com/{interface}/{version}/{appId}/{fileId}?callback=jquery_callback
 * 普通防盗链
 * https://playvideo.qcloud.com/{interface}/{version}/{appId}/{fileId}?callback=jquery_callback&playerid=233&t=5949fdc9&us=test_user&sign=xxx
 * 带试看的防盗链
 * https://playvideo.qcloud.com/{interface}/{version}/{appId}/{fileId}?callback=jquery_callback&playerid=233&t=5949fdc9&exper=300&us=test_user&sign=xxx
 * version:v2
 * interface:getplayinfo
 *
 * @extends Component
 */
class MediaAsyncLoader extends Component {

  /**
   * Create an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should attach to.
   *
   * @param {Object} [options]
   *        The key/value stroe of player options.
   *
   * @param {Component~ReadyCallback} [ready]
   *        The function that is run when this component is ready.
   */
  constructor(player, options, ready) {
    // MediaLoader has no element
    const options_ = mergeOptions({createEl: false}, options);
    super(player, options_, ready);

    let playerOptions = options_.playerOptions;
    //加载需要的播放模块
    //如果传入fileID 则异步执行super
    // log('MediaAsyncLoader', options_, playerOptions);
    if (playerOptions.fileID && playerOptions.appID) {
      this.getInfo(playerOptions.appID, playerOptions.fileID);
    }
  }
  getInfo(appID, fileID){
    let player = this.player();
    let url = '//playvideo.qcloud.com/index.php';
    jsonp(url, {
      param: 'interface=Vod_Api_GetPlayInfo&app_id=' + appID + '&file_id=' + fileID + '&callback',
      timeout: 1000 * 10,
      prefix: 'TcCallBack'
    }, function (error, result) {
      if (!error) {
        log('play cgi', result);
        player.poster(result.data.file_info.image_url);
        player.src([
          {
            src: '//bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
            type: 'application/x-mpegURL',
            label: '720p'//如果设置了，认为开启了分辨率切换功能
          }, {
            src: '//1251132611.vod2.myqcloud.com/4126dd3evodtransgzp1251132611/8a592f8b9031868222950257296/f0.f40.mp4',
            type: 'video/mp4',
            label: '480p'
          }
        ]);
      } else {
        //error timeout
        log.error(error);
      }
    });
  }

  /**
   *
   * @param data
   * @returns {{}}
   */
  parserCgiData(playerInfo){
    /**
     *  masterPlaylist {Object}
     *    HLS master playlist，包含所有的hls media playlist
     *  transcodeList {Array}
     *    转码后的视频数据，可能是mp4、hls media playlist、flv[待定]
     */
    let masterPlaylist = playerInfo.videoInfo.masterPlaylist,
        transcodeList = playerInfo.videoInfo.transcodeList,
        sources = [];
    //优先使用master playlist
    if(masterPlaylist){

    }else{
      //
      for(let i=0; i < transcodeList.length; i++){
        let source = {
          'src' : transcodeList[i].url,
          'type' : this.getMIMEType(transcodeList[i].url),
          'label': '',
          'id': transcodeList[i].definition
        };
      }
    }
    return sources;
  }

  //getMIMEType
  getMIMEType(url){
    let mineType = Constant.EXT_MIME[getFileExtension(url)];
    if(mineType){
      return mineType;
    }else{
      log.error('mine type no found!');
      return '';
    }
  }
}

Component.registerComponent('MediaAsyncLoader', MediaAsyncLoader);

export default MediaAsyncLoader;
