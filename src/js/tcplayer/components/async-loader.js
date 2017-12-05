/**
 * @file async-loader.js
 */
import Component from '../../component.js';
import mergeOptions from '../../utils/merge-options.js';
import log from '../../utils/log.js';
import * as Fn from '../../utils/fn.js';
import { getFileExtension, isCrossOrigin } from '../../utils/url.js';
import * as Constant from '../constant.js';
import jsonp from '../utils/jsonp.js';
import md5 from 'blueimp-md5';
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
 * @link MultiResolution
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
    let url = '//playvideo.qcloud.com/index.php'; // Constant.SERVER_PATH
    jsonp(url, {
      param: {
        'interface': 'Vod_Api_GetPlayInfo',
        'app_id': appID,
        'file_id': fileID,
      },
      timeout: 1000 * 10,
      prefix: 'TcCallBack'
    }, Fn.bind(this, this.onResult));
  }
  onResult(error, result){
    let player = this.player();
    if (!error) {
      log('play cgi', result);

      result = {
        "code": 0,
        "message": "",
        "playerInfo": {
          "playerId": "64655",
          "name": "初始播放器",
          "patchList": "贴片url  需要重构",
          "videoClassification": [
            {
              "id":"LD",
              "name": "低清",
              "definitionList": [10, 210]
            },
            {
              "id": "SD",
              "name": "标清",
              "definitionList": [20, 220]
            },
            {
              "id": "HD",
              "name": "高清",
              "definitionList": [30, 230]
            },
            {
              "id": "FHD",
              "name": "超清",
              "definitionList": [40, 240]
            },
            {
              "id": "2K",
              "name": "2k",
              "definitionList": []
            }
          ],
          "coverInfo": {
            "coverUrl": "//p.qpic.cn/videoyun/0/200002400_202abdae6f1a11e6a7e02f1fb3c08277_1/640"
          },
          "imageSpriteInfo": {
            "imageSpriteList": [{
              "definition": 10,
              "templateName": "默认雪碧图模板",
              "height": 576,
              "width": 1024,
              "totalCount": 100,
              "webVttUrl": "http://xxx/yyy.vtt",
              "imageUrls": [
                "http://xxxx.vod2.myqcloud.com/xxxx/xxxx/imageSprite/1490065623_3650079727.100_0.jpg"
              ]
            }]
          },
          "videoInfo": {
            "sourceVideo": {
              "size": 10556,
              "container": "m4a",
              "duration": 3601,
              "bitrate": 246035,
              "height": 480,
              "width": 640,
              "videoStreamList": [{
                "bitrate": 246000,
                "height": 480,
                "width": 640,
                "codec": "h264",
                "fps": 222
              }],
              "audioStreamList": [{
                "codec": "aac",
                "samplingRate": 44100,
                "bitrate": 35
              }]
            },
            "masterPlaylist": {
              "idrAligned": true,
              "url": "//bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
              "definition": 10000,
              "templateName": "HLS Master Playlist",
              "md5": "bfcf7c6f154b18890661f9e80b0731d0"
            },
            "transcodeList": [{
              "url": "//1251132611.vod2.myqcloud.com/4126dd3evodtransgzp1251132611/8a592f8b9031868222950257296/f0.f20.mp4",
              "definition": 20
            },{
              "url": "//1251132611.vod2.myqcloud.com/4126dd3evodtransgzp1251132611/8a592f8b9031868222950257296/f0.f40.mp4",
              "definition": 40
            },{
              "url": "//1251132611.vod2.myqcloud.com/4126dd3evodtransgzp1251132611/8a592f8b9031868222950257296/f0.f220.m3u8",
              "definition": 210
            },{
              "url": "//1251132611.vod2.myqcloud.com/4126dd3evodtransgzp1251132611/8a592f8b9031868222950257296/f0.f230.m3u8",
              "definition": 230
            },{
              "url": "//1251132611.vod2.myqcloud.com/4126dd3evodtransgzp1251132611/8a592f8b9031868222950257296/f0.f240.m3u8",
              "definition": 240
            }]
          }
        }
      };
      player.poster(result.playerInfo.coverInfo.coverUrl);
      let data;
      if(result.playerInfo.videoInfo.masterPlaylist){
        // user master playlist 优先使用master playlist
        player.src(this.getMasterSouces(result.playerInfo));
      }else{
        // use multi resolution sources
        player.MultiResolution().update(this.getMultiResolutionSouces(result.playerInfo));
      }
      // 更新logo数据
      player.trigger({ type: 'logochange', data: {
        img:{
          url: 'http://1251132611.vod2.myqcloud.com/8cff3a96vodgzp1251132611/0/player/4564972818595134884.png',
          position: 'left-top'
        },
        link: 'http://www.qq.com'
      }});
    } else {
      //error or timeout
      log.error(error);
      this.player().error({'code':'-2'});
    }
  }

  /**
   * 获取master player list 提供给player.src & quality switcher
   * @param playerInfo
   * @returns {Array}
   *  - Array
   *    [{
   *      'src': ''
   *      'type': ''
   *    }]
   */
  getMasterSouces(playerInfo) {
    let masterPlaylist = playerInfo.videoInfo.masterPlaylist,
      sources = [];
    sources.push({
      'src': masterPlaylist.url,
      'type': Constant.EXT_MIME['m3u8']
    });
    return sources
  }

  /**
   * 获取多分辨率数据 提供给mutil resolution plugin & quality switcher 使用
   * @param playerInfo
   * @returns {{sources: {}, labels: {}, showOrder: Array, defaultRes: string}}
   *  - Object
   *    multiResolution:
   *    {
   *      'sources': {'sd':[{Object}]}
   *      'labels': {'sd':'标清','hd':'高清'},
   *      'showOrder': ['sd','hd'],
   *      'defaultRes': 'sd'
   *    }
   */
  getMultiResolutionSouces(playerInfo) {
    let multiResolution = {
        'sources': {},
        'labels': {},
        'showOrder': [],
        'defaultRes': ''
      },
      sources = [],
      transcodeList = playerInfo.videoInfo.transcodeList,
      resolutionConfig = playerInfo.videoClassification,
      self = this;
    resolutionConfig.forEach(function (configItem, index) {
      // console.log(configItem, index);
      if(transcodeList.length > 0){
        // console.log(transcodeList.length, multiResolution);
        // 根据清晰度配置，过滤出符合配置的视频sources
        transcodeList = transcodeList.filter(function (source) {
          if(configItem['definitionList'].indexOf(source.definition)>-1){
            if(!sources[configItem.id]){
              //switcher控件的默认显示顺序将按照接口返回配置的数组顺序
              multiResolution['showOrder'].push(configItem.id);
              multiResolution['labels'][configItem.id] = configItem.name;
              sources[configItem.id] = [];
            }
            sources[configItem.id].push({
              'src' : source.url,
              'type' : self.getMIMEType(source.url),
            });
          }else{
            return true;
          }
        });
      }
    });
    multiResolution['sources'] = sources;
    //默认播放清晰度，需要接口返回
    multiResolution['defaultRes'] = playerInfo.defaultRes || Object.keys(sources)[0];
    // console.log(multiResolution);
    return multiResolution;
  }

  /**
   * 根据url的文件扩展名，获取对应的mime type
   * @param url
   * @returns {string}
   */
  getMIMEType(url){
    let mineType = Constant.EXT_MIME[getFileExtension(url)];
    if(mineType){
      return mineType;
    }else{
      log.error('mine type no found!');
      return '';
    }
  }

  /**
   * 对sources进行排序，优先级rtmp>flv>m3u8>mp4
   */
}

Component.registerComponent('MediaAsyncLoader', MediaAsyncLoader);

export default MediaAsyncLoader;
