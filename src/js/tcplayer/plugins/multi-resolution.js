import videojs from '../../video.js';

const Plugin = videojs.getPlugin('plugin');

let defaultOptions = {
  'labels': {'FLU': '流畅', 'SD': '标清', 'HD': '高清', 'FHD': '超清'},
  'showOrder': ['FLU', 'SD', 'HD', 'FHD'],
  'defaultRes': 'SD'
};

class MultiResolution extends Plugin{
  /**
   *
   * 用于支持传入多种分辨率的视频，依赖 QualitySwitcher
   * {@link QualitySwitcher}
   * multiResolution:
   * {
   *  sources:{'SD':[{Object}]}
   *  labels:{'SD':'标清','HD':'高清'},
   *  showOrder:['FLU', 'SD', 'HD', 'FHD'],
   *  defaultRes: 'SD'
   * }
   */
  constructor(player, options) {
    super(player);
    console.log('new MultiResolution', options);
    this.options = options;
    this.hasInit = false;
    player.on('multiresolutionchange', videojs.bind(this, function (event) {
      if(event.data){
        this.update(data);
      }
    }));
    player.ready(videojs.bind(this, function(){
      let tech = player.tech(true);
      if(tech){
        tech.on('masterplaylistchange', videojs.bind(this, this.onMasterPlaylistChange));
      }
    }));
    this.init(this.player.options_.multiResolution);
  }

  /**
   * 初始化数据
   * @param data
   * data = {Object} multiResolution
   */
  init(data) {
    let player = this.player,
      options = videojs.mergeOptions(defaultOptions, this.options, data),
      multiResSources = options && options.sources;
    this.options = options;
    console.log('MultiResolution', this);
    if (multiResSources) {
      this.currentID = options.defaultRes = options.defaultRes || Object.keys(multiResSources)[0];
      if(player.options_.children[0] == 'mediaLoader' && !this.hasInit){
        //设置原始的sources，在medialoader初始化时使用
        player.options_.sources.push(...multiResSources[this.currentID]);
      }else{
        player.src(multiResSources[this.currentID]);
      }
      if (!this.hasInit) {
        this.hasInit = true;
      }
      //通过事件初始化切换清晰度组件
      player.ready(videojs.bind(this, function () {
        player.trigger({type: 'loadedqualitydata', data: this.initQualityData(options)});
        //避免切换的时候 video 的poster自动显示，需要删除h5 tech自带的poster
        player.one('loadstart', function () {
          // console.log('loadstart', tech);
          let tech = this.tech(true);
          if ('Html5' == tech.name_ && tech.el_.getAttribute('poster')) {
            tech.el_.setAttribute('poster', '');
          }
        });
      }));
    }
  }

  /**
   * 更新多分辨率数据
   * @param data
   * data = {Object} multiResolution
   */
  update(data){
    // console.log(this, data);
    this.init(data);
  }

  /**
   * 处理hls获取的master playlist数据，重新匹配配置的显示分辨率、labels、order等
   * @param event
   */
  onMasterPlaylistChange(event){
    console.log('onMasterPlaylistChange', event);
    // let tech = this.player.tech(true);
    player.trigger({type: 'loadedqualitydata', data: event.data});
  }
  /**
   * quality switcher 的回调函数，参数为选中的item options
   * @param data
   *  ｛
   *    'id': {String}
   *    'label': {String}
   *    'selected': {Boolean}
   *  ｝
   */
  switchResolution(data){
    if(this.currentID == data.id){
      return ;
    }
    let player = this.player;
    let currentTime = player.currentTime();
    let isPaused = player.paused();

    let w = player.controlBar.progressControl.seekBar.playProgressBar.el().style.width;
    // ios 必须loadeddata后才能设置currentTime
    // loadedmetadata trigger faster then loadeddata
    let event = videojs.browser.IS_IOS || videojs.browser.IS_ANDROID ? 'loadeddata' : 'loadedmetadata';
    // console.log('switchResolution');
    player.one(event, function () {
      player.controlBar.progressControl.seekBar.playProgressBar.el().style.width = w;
      player.currentTime(currentTime);
      // console.log('switch', event,player.tech(true));
      // player.bigPlayButton && player.bigPlayButton.show();
      // player.posterImage && player.posterImage.show();
      // FLash模式下需要手动处理seeked事件
      if(player.techName_ == 'Flash'){
        // flash 模式下无法直接pause 必须调用play后，延迟调用pause
        player.play();
        if(isPaused){
          setTimeout(function(){
            player.pause();
          },1);
        }
        // player.handleTechSeeked_();
        player.tech(true).trigger('seeked');
      }else{
        let promise = player.play();
        // 某些浏览器例如chrome 不能同步调用pause
        if(promise){
          promise.then(function () {
            if(isPaused){
              player.pause();
            }
          });
        }
      }
    });
    player.bigPlayButton && player.bigPlayButton.hide();
    player.posterImage && player.posterImage.hide();
    this.currentID = data.id;
    player.src(this.options.sources[data.id]);
  }

  /**
   * 初始化切换器需要的数据
   * @param originData
   *  via multiResolution
   * @returns {Object}
   * ｛
   *    qualityData：｛
   *      'video':[{
   *        'id': {String}
   *        'label': {String}
   *        'selected': {Boolean}
   *      }]
   *    ｝
   *    callbacks：｛
   *      'video': {function}
   *    ｝
   * ｝
   */
  initQualityData(originData){
    let list = [],
        sources = originData.sources,
        labels = originData.labels,
        showOrder = originData.showOrder;
    if(showOrder.length>0){
      showOrder.forEach(function (val, key) {
        let resolution = {};
        resolution.id = val;
        resolution.selected = originData.defaultRes === val;
        resolution.label = labels[val];
        list.push(resolution);
      });
    }
    return {
      'qualityData':{
        'video': list
      },
      'callbacks':{
        'video': videojs.bind(this, this.switchResolution)
      }
    };
  }

  /**
   * 根据播放格式优先级配置，对原始sources进行排序
   * @param origin
   * @returns {Array}
   */
  sortSourceOrder(origin){
    let source=[];
    return source;
  }
}

videojs.registerPlugin('MultiResolution', MultiResolution);

export default MultiResolution;
