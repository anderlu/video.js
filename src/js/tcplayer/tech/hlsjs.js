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
    let duration = 0;

    //处理异常
    hls.on(Hls.Events.ERROR, this.onError.bind(this));
    hls.on(Hls.Events.MANIFEST_PARSED, this.onMetaData.bind(this));
    hls.on(Hls.Events.LEVEL_LOADED, function(event, data) { duration = data.details.live ? Infinity : data.details.totalduration; });

    hls.attachMedia(video);
    hls.loadSource(source.src);
    this.hls = hls;
    this.duration = duration;
  }
  switchQuality(qualityId, trackType){

  }
  dispose(){
    this.hls.destroy();
  }
  onMetaData(event, data){
    console.log('hlsjs onMetaData');
  }
  onError(event,data){
    console.log('hlsjs onError');
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

