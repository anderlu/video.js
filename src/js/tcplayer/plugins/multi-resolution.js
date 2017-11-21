import videojs from '../../video.js';

const Plugin = videojs.getPlugin('plugin');

let defaultOptions = {
  'labels': {'sd':'标清','hd':'高清'},
  'showOrder': ['sd','hd'],
  'defaultRes': 'sd'
};

class MultiResolution extends Plugin{
  /**
   *
   * 用于支持传入多种分辨率，依赖 QualitySwitcher
   * {@link QualitySwitcher}
   * multiResolution:
   * {
   *  sources:{'sd':[{Object}]}
   *  labels:{'sd':'标清','hd':'高清'},
   *  showOrder:['sd','hd'],
   *  defaultRes: 'sd'
   * }
   */
  constructor(player, options) {
    super(player);
    // console.log('MultiResolution new', player, options);
    this.options = options;
    player.on('multiresolutionchange', videojs.bind(this, this.init));
    this.init();
  }

  /**
   *
   * @param event
   * event.data = {Object} multiResolution
   */
  init(event) {
    let player = this.player,
        options = videojs.mergeOptions(defaultOptions, this.options, this.player.options_.multiResolution),
        multiResSources = options && options.sources;
    this.options = options;
    console.log('MultiResolution', this);
    if(multiResSources){
      if(options.defaultRes){
        //设置原始的sources，在medialoader初始化时使用
        player.options_.sources.push(...multiResSources[options.defaultRes]);
        // multiResSources[options.defaultRes].forEach(function(source) {
        //   player.options_.sources.push(source);
        // });
      }
      player.ready(videojs.bind(this, function () {
        let tech = this.player.tech(true);
        tech.trigger({ type: 'loadedqualitydata', data: this.initQualityData(options) });
        //避免切换的时候 video的poster自动显示
        if('Html5' == tech.name_){
          delete tech.el_.poster;
          player.one('loadedmetadata', function () {
            tech.el_.setAttribute('poster','');
          });
        }
      }));
    }
  }
  switchResolution(data){
    let player = this.player;
    let currentTime = player.currentTime();
    let isPaused = player.paused();
    //loadedmetadata
    // let event = 'loadeddata';
    let event = 'loadedmetadata';
    player.one(event, function () {
      player.currentTime(currentTime);
      let promise = player.play();
      if(promise){
        promise.then(function () {
          if(isPaused){
            player.pause();
          }
        });
      }
      //   player.bigPlayButton && player.bigPlayButton.show();
      //   player.posterImage && player.posterImage.show();
      // player.handleTechSeeked_();
    });
    // if(!isPaused){
    player.bigPlayButton && player.bigPlayButton.hide();
    player.posterImage && player.posterImage.hide();
    // }
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
}

videojs.registerPlugin('MultiResolution', MultiResolution);

export default MultiResolution;
