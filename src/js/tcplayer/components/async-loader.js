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

  /**
   * 无防盗链
   * https://playvideo.qcloud.com/{interface}/{version}/{appId}/{fileId}?callback=jquery_callback&refer=somehost.com
   * 普通防盗链
   * https://playvideo.qcloud.com/{interface}/{version}/{appId}/{fileId}?callback=jquery_callback&refer=somehost.com&playerid=233&t=5949fdc9&us=test_user&sign=xxx
   * 带试看的防盗链
   * https://playvideo.qcloud.com/{interface}/{version}/{appId}/{fileId}?callback=jquery_callback&refer=somehost.com&playerid=233&t=5949fdc9&exper=300&us=test_user&sign=xxx
   * version:v2
   * interface:getplayinfo
   * t: 加密链接超时时间戳，转换为16进制小写字符串，腾讯云 CDN 服务器会根据该时间判断该链接是否有效	防盗链有效期，建议不要比视频时长短
   * us: 唯一标识请求，增加链接唯一性	建议尽量随机化
   * exper: 试看时长，单位：秒，十进制数值。试看防盗链须带的参数，0表示不试看，即返回完整视频。mp4、ts 的试看时长不能大于原视频时长，否则出错
   * sign:  签名字符串	对于普通防盗链和带试看功能防盗链
   *
   * 普通防盗链签名：
   * sign = md5(KEY+appId+fileId+t+us)
   *
   * 带试看的防盗链签名：
   * sign = md5(KEY+appId+fileId+t+exper+us)
   *
   * 例子
   * http://playvideo.qcloud.com/getplayinfo/v2/1255566655/4564972818519602447?&t=5c08d9fa&us=someus&sign=65b202bc855c0981da719f2d8df85859
   * @param appID
   * @param fileID
   */
  getInfo(appID, fileID){
    let player = this.player();
    // let url = '//playvideo.qcloud.com/index.php'; // Constant.SERVER_PATH
    let url = this.assemblyPath('getplayinfo', appID, fileID); // Constant.SERVER_PATH
    let t = '5c08d9fa' ,
        key = 'mykey',
        us = +new Date(),
        sign = md5(key+appID+fileID+t+us);
    jsonp(url, {
      // param: {
      //   'interface': 'Vod_Api_GetPlayInfo',
      //   'app_id': appID,
      //   'file_id': fileID,
      // },
      param: {
        't': '5c08d9fa',
        // 'us': 'someus' ,
        // 'sign': '65b202bc855c0981da719f2d8df85859',
        'us': us,
        'sign': sign,
      },
      timeout: 1000 * 6,
      prefix: 'TcCallBack'
    }, Fn.bind(this, this.onResult));
  }
  onResult(error, result){
    let player = this.player();
    if (!error) {
      log('play cgi', result);

      // result = {
      //   "code": 0,
      //   "message": "",
      //   "playerInfo": {
      //     "playerId": "64655",
      //     "name": "初始播放器",
      //     "patchList": "贴片url  需要重构",
      //     "videoClassification": [
      //       {
      //         "id": "LD",
      //         "name": "低清",
      //         "definitionList": [10, 210]
      //       },
      //       {
      //         "id": "SD",
      //         "name": "标清",
      //         "definitionList": [20, 220]
      //       },
      //       {
      //         "id": "HD",
      //         "name": "高清",
      //         "definitionList": [30, 230]
      //       },
      //       {
      //         "id": "FHD",
      //         "name": "超清",
      //         "definitionList": [40, 240]
      //       },
      //       {
      //         "id": "2K",
      //         "name": "2k",
      //         "definitionList": []
      //       }
      //     ],
      //   },
      //   "coverInfo": {
      //     "coverUrl": "//p.qpic.cn/videoyun/0/200002400_202abdae6f1a11e6a7e02f1fb3c08277_1/640"
      //   },
      //   "imageSpriteInfo": {
      //     "imageSpriteList": [{
      //       "definition": 10,
      //       "templateName": "默认雪碧图模板",
      //       "height": 576,
      //       "width": 1024,
      //       "totalCount": 100,
      //       "webVttUrl": "http://xxx/yyy.vtt",
      //       "imageUrls": [
      //         "http://xxxx.vod2.myqcloud.com/xxxx/xxxx/imageSprite/1490065623_3650079727.100_0.jpg"
      //       ]
      //     }]
      //   },
      //   "videoInfo": {
      //     "sourceVideo": {
      //       "size": 10556,
      //       "container": "m4a",
      //       "duration": 3601,
      //       "bitrate": 246035,
      //       "height": 480,
      //       "width": 640,
      //       "videoStreamList": [{
      //         "bitrate": 246000,
      //         "height": 480,
      //         "width": 640,
      //         "codec": "h264",
      //         "fps": 222
      //       }],
      //       "audioStreamList": [{
      //         "codec": "aac",
      //         "samplingRate": 44100,
      //         "bitrate": 35
      //       }]
      //     },
      //     "masterPlayList": {
      //       "idrAligned": true,
      //       "url": "//bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
      //       "definition": 10000,
      //       "templateName": "HLS Master Playlist",
      //       "md5": "bfcf7c6f154b18890661f9e80b0731d0"
      //     },
      //     "transcodeList": [{
      //       "url": "//1251132611.vod2.myqcloud.com/4126dd3evodtransgzp1251132611/8a592f8b9031868222950257296/f0.f20.mp4",
      //       "definition": 20
      //     },{
      //       "url": "//1251132611.vod2.myqcloud.com/4126dd3evodtransgzp1251132611/8a592f8b9031868222950257296/f0.f40.mp4",
      //       "definition": 40
      //     },{
      //       "url": "//1251132611.vod2.myqcloud.com/4126dd3evodtransgzp1251132611/8a592f8b9031868222950257296/f0.f220.m3u8",
      //       "definition": 210
      //     },{
      //       "url": "//1251132611.vod2.myqcloud.com/4126dd3evodtransgzp1251132611/8a592f8b9031868222950257296/f0.f230.m3u8",
      //       "definition": 230
      //     },{
      //       "url": "//1251132611.vod2.myqcloud.com/4126dd3evodtransgzp1251132611/8a592f8b9031868222950257296/f0.f240.m3u8",
      //       "definition": 240
      //     }]
      //   }
      // };
      player.poster(result.coverInfo.coverUrl);
      let data;
      if(0 &&result.videoInfo.masterPlayList){
        // user master playlist 优先使用master playlist
        player.src(this.getMasterSouces(result.videoInfo));
      }else{
        // use multi resolution sources
        player.MultiResolution().update(this.getMultiResolutionSouces(result));
      }
      // 更新logo数据
      player.trigger({ type: 'logochange', data: {
        img:{
          url: result.playerInfo.logoPic || 'http://1251132611.vod2.myqcloud.com/8cff3a96vodgzp1251132611/0/player/4564972818595134884.png',
          position: result.playerInfo.logoLocation
        },
        link: result.playerInfo.logoUrl || 'http://www.qq.com'
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
  getMasterSouces(videoInfo) {
    let masterPlaylist = videoInfo.masterPlayList,
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
  getMultiResolutionSouces(result) {
    let multiResolution = {
        'sources': {},
        'labels': {},
        'showOrder': [],
        'defaultRes': ''
      },
      sources = [],
      transcodeList = result.videoInfo.transcodeList,
      resolutionConfig = result.playerInfo.videoClassification,
      self = this;
    resolutionConfig.forEach(function (configItem, index) {
      // console.log(configItem, index);
      if(transcodeList.length > 0){
        // console.log(transcodeList.length, multiResolution);
        // 根据清晰度配置，过滤出清晰度在configItem中存在的视频,并按照resolutionConfig的遍历顺序push到sources
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
    //默认播放清晰度，需要接口返回，如果没有则默认取第一个
    multiResolution['defaultRes'] = result.playerInfo.defaultResolution || Object.keys(sources)[0];
    console.log(multiResolution);
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

  assemblyPath(action, appID, fileID){
    return `//playvideo.qcloud.com/${action}/v2/${appID}/${fileID}?` ;
  }

}

Component.registerComponent('MediaAsyncLoader', MediaAsyncLoader);

export default MediaAsyncLoader;
