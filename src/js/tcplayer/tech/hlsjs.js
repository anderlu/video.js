/**
 * User: anderlu
 * Date: 2017/10/9
 * Time: 19:54
 */
/**
 * 引入hls.js实现h5播放hls的功能
 * @extends
 */

import videojs from  '../../video.js';
import Hls from 'hls.js';

class Html5HlsJS{
  constructor(source, tech, options){
    let hls = new Hls(options.hlsjsConfig);
    let video = tech.el();
    console.log(arguments);
    this.tech = tech;
    this.hls = hls;
    //处理异常
    hls.on(Hls.Events.ERROR, this.onError.bind(this));
    hls.on(Hls.Events.MANIFEST_PARSED, this.onMetaData.bind(this));
    hls.on(Hls.Events.LEVEL_LOADED, this.onLevelLoaded.bind(this));
    //监听所有hls.js 事件
    for(let eventName in Hls.Events){
      hls.on(Hls.Events[eventName], videojs.bind(this, this.onEvent));
    }
    hls.attachMedia(video);
    hls.loadSource(source.src);
  }
  switchQuality(qualityId){
    this.hls.nextLevel = qualityId;
  }
  dispose(){
    this.hls.destroy();
  }
  onEvent(event,data){
    // console.log('hlsjs onEvent', event, data);
    this.tech.trigger({ type: event, data: data });
  }
  onMetaData(event, data){
    console.log('hlsjs onMetaData', event, data);
    let cleanTracklist = [];
    let _hls = this.hls;

    if (data.levels.length > 1) {
      let autoLevel = {
        id: -1,
        label: "auto",
        selected: -1 === _hls.manualLevel
      };
      cleanTracklist.push(autoLevel);
    }

    data.levels.forEach(function(level, index) {
      let quality = {}; // Don't write in level (shared reference with Hls.js)
      quality.id = index;
      quality.selected = index === _hls.manualLevel;
      quality.label = _levelLabel(level);

      cleanTracklist.push(quality);
    });

    var payload = {
      qualityData: {video: cleanTracklist},
      qualitySwitchCallback: this.switchQuality
    };
    console.log('hlsjs onMetaData', payload);

    this.tech.trigger({ type: 'loadedqualitydata', data: payload });

    function _levelLabel(level) {
      if (level.height) return level.height + "p";
      else if (level.width) return Math.round(level.width * 9 / 16) + "p";
      else if (level.bitrate) return (level.bitrate / 1000) + "kbps";
      else return 0;
    }
  }
  onLevelLoaded(event, data){
    console.log('hlsjs level loaded', event, data);
    this._duration = data.details.live ? Infinity : data.details.totalduration;
  }
  onError(event,data){
    console.log('hlsjs onError', event, data);
  }
  duration(){
    return this._duration;
  }
}

var hlsTypeRE = /^application\/(x-mpegURL|vnd\.apple\.mpegURL)$/i;
var hlsExtRE = /\.m3u8/i;

var HlsSourceHandler = {
  canHandleSource: function(source) {
    if (source.skipHlsJs) {
      return '';
    } else if (hlsTypeRE.test(source.type)) {
      return 'probably';
    } else if (hlsExtRE.test(source.src)) {
      return 'maybe';
    } else {
      return '';
    }
  },
  handleSource: function(source, tech, options) {
    if(tech.hlsProvider){
      tech.hlsProvider.dispose();
    }
    tech.hlsProvider = new Html5HlsJS(source, tech, options);
    return tech.hlsProvider;
  },
  canPlayType: function(type) {
    if (hlsTypeRE.test(type)) {
      return 'probably';
    }
    return '';
  }
};

if (Hls.isSupported()) {
  try{
    var html5Tech = videojs.getTech && videojs.getTech('Html5');
    if (html5Tech) {
      html5Tech.registerSourceHandler(HlsSourceHandler, 0);
    }
  }catch (e){
    console.error('videojs-hls.js init failed');
  }
}else{
  console.error('Hls.js is not supported in this browser!');

}

