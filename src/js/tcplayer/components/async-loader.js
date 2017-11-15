/**
 * @file loader.js
 */
import Component from '../../component.js';
import mergeOptions from '../../utils/merge-options.js';
import log from '../../utils/log.js';
import { isCrossOrigin } from '../../utils/url.js';
// import resourceLoader from '../utils/resource-loader.js';
import XHR from 'xhr';
import jsonp from '../utils/jsonp.js';

/**
 * MediaAsyncLoader 会检测当前播放环境，分析传入的视频格式，异步加载需要的播放组件例如 hls.js、flv.js 等，用于替代loader.js的逻辑
 * when a player is initialized.
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

    let url = '//playvideo.qcloud.com/index.php';
    /**
     file_id:14651978969267306533
     interface:Vod_Api_GetPlayInfo
     app_id:1251763412
     _t:1510732233112
     refer:playvideo.qcloud.com
     */
    //加载需要的播放模块
    //如果传入fileID 则异步执行super
    log('MediaAsyncLoader', options_, playerOptions);
    if(playerOptions.fileID && playerOptions.appID){
      jsonp(url, {
          param:'interface=Vod_Api_GetPlayInfo&app_id='+playerOptions.appID+'&file_id='+playerOptions.fileID+'&callback',
          timeout:1000*10,
          prefix:'TcCallBack'
        },function(error, data) {
          if(!error){
            log('play cgi',data);
          }else{
            //error timeout
            log.error(error);
          }
      });
      // XHR({
      //   useXDR: true,
      //   method: 'get',
      //   body: {
      //     'file_id': playerOptions.fileID,
      //     'appID': playerOptions.appID,
      //     'interface': 'Vod_Api_GetPlayInfo'
      //   },
      //   uri: url,
      //   headers: {
      //   }
      // }, function (err, resp, body) {
      //   // check resp.statusCode
      //   console.log(err, resp, body);
      // });
    }
    // if(options_.fileID && options_.appID){
    //   xhr({
    //     method: "post",
    //     body: someJSONString,
    //     uri: "/foo",
    //     headers: {
    //       "Content-Type": "application/json"
    //     }
    //   }, function (err, resp, body) {
    //     // check resp.statusCode
    //   })
    // }else{
    //
    // }

    // resourceLoader('//unpkg.com/videojs-contrib-hls.js@3.0.3/dist/videojs-contrib-hlsjs.min.js', {
    //   success: function () {
    //     console.log('load hls done');
    //   }
    // });

  }
}

Component.registerComponent('MediaAsyncLoader', MediaAsyncLoader);

export default MediaAsyncLoader;
