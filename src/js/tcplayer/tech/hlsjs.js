import videojs from  '../../video.js';
import Hls from 'hls.js';

class Html5HlsJS{
  /**
   * 引入hls.js实现h5播放hls的功能
   * 已实现的接口：
   * 播放hls
   *
   * @extends
   */
  constructor(source, tech, options) {
    let hls = new Hls(options.hlsjsConfig);
    let video = tech.el();
    this.Hls = Hls;
    this.tech = tech;
    this.hls = hls;
    this.manifests = [];
    //处理异常
    // create separate error handlers for hlsjs and the video tag
    this.hlsjsErrorHandler = this.errorHandlerFactory();

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
  switchQuality(data){
    // console.log(data, this.hls);
    if(data.id != this.hls.currentLevel){
      this.hls.nextLevel = data.id;
    }
  }
  dispose(){
    this.hls.destroy();
  }
  onEvent(event,data){
    // console.log('hlsjs onEvent', event, data);
    this.tech.trigger({ type: event, data: data });
    switch (event){
      //m3u8列表加载成功后，保存列表信息，可进一步分析里面的数值，比如直播回看Dvr.js需要解析出直播流的开始时间和可时移时长
      case Hls.Events.MANIFEST_LOADED:
        this.manifests.push(data.networkDetails.response || data.networkDetails.responseText);
        console.log(Hls.Events.MANIFEST_LOADED, this.manifests);
        break;
    }
  }
  onMetaData(event, data){
    // console.log('hlsjs onMetaData', event, data);
    let cleanTracklist = [];
    let _hls = this.hls;
    //更新hls level 数据
    if (data.levels.length > 1) {
      let autoLevel = {
        id: -1,
        label: "auto",
        selected: -1 === _hls.manualLevel
      };
      cleanTracklist.push(autoLevel);
    }

    data.levels.forEach(function(level, index) {
      let resolution = {};
      resolution.id = index;
      resolution.selected = index === _hls.manualLevel;
      resolution.label = _levelLabel(level);
      //TODO 需要处理label自定义
      cleanTracklist.push(resolution);
    });

    var payload = {
      qualityData: {video: cleanTracklist},
      callbacks: {video: videojs.bind(this, this.switchQuality)}
    };
    // console.log('hlsjs onMetaData', payload);
    // 加载并解析master playlist后更新media playlist信息，并发出事件。
    // 为了避免hls解析快于插件初始化，导致插件不能正常触发时间，这里做延迟处理。
    this.tech.setTimeout(function () {
      this.trigger({ type: 'loadedqualitydata', data: payload });
    },1);
    // this.tech.trigger({ type: 'loadedqualitydata', data: payload });
    let self = this;
    function _levelLabel(level) {
      // console.log(level, self);
      if (level.height) return level.height + "p";
      else if (level.width) return Math.round(level.width * 9 / 16) + "p";
      else if (level.bitrate) return (level.bitrate / 1000) + "kbps";
      else return 0;
    }
  }
  onLevelLoaded(event, data){
    // console.log('hlsjs level loaded', event, data);
    this._duration = data.details.live ? Infinity : data.details.totalduration;
  }
  onError(event,data){
    console.log('hlsjs onError', event, data);
    if (data.fatal) {
      switch (data.type) {
        case Hls.ErrorTypes.NETWORK_ERROR:
          // this.hls.startLoad();
          break;
        case Hls.ErrorTypes.MEDIA_ERROR:
          this.hlsjsErrorHandler();
          break;
        default:
          console.error('Error loading media: File could not be played');
          break;
      }
    }
  }
  errorHandlerFactory(){
    let hls = this.hls;
    var _recoverDecodingErrorDate = null;
    var _recoverAudioCodecErrorDate = null;

    return function() {
      var now = Date.now();

      if (!_recoverDecodingErrorDate || (now - _recoverDecodingErrorDate) > 2000) {
        _recoverDecodingErrorDate = now;
        hls.recoverMediaError();
      }
      else if (!_recoverAudioCodecErrorDate || (now - _recoverAudioCodecErrorDate) > 2000) {
        _recoverAudioCodecErrorDate = now;
        hls.swapAudioCodec();
        hls.recoverMediaError();
      }
      else {
        console.error('Error loading media: File could not be played');
      }
    };
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

if (Hls && Hls.isSupported()) {
  try{
    var html5Tech = videojs.getTech && videojs.getTech('Html5');
    if (html5Tech) {
      html5Tech.registerSourceHandler(HlsSourceHandler, 0);
    }
  }catch (e){
    console.error('videojs-hls.js init failed');
  }
}else{
  //没有引入hls.js,可上报log
}

