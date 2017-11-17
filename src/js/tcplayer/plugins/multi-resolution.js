import videojs from '../../video.js';

const Plugin = videojs.getPlugin('plugin');
class MultiResolution extends Plugin{
  /**
   *
   * 用于支持传入多种分辨率，依赖 QualitySwitcher
   * {@link QualitySwitcher}
   *
   */
  constructor(player, options) {
    super(player);
    console.log('MultiResolution new', player, options);
    player.on('multiresolutionchange', videojs.bind(this, this.init));
    this.init();
  }
  init(event) {
    let player = this.player,
        options = this.player.options_.multiResolution,
        multiResSources = options && options.sources;
    console.log('MultiResolution', multiResSources,player.options_.playerOptions);
    if(multiResSources){
      if(options.defaultRes){
        player.options_.sources.push(...multiResSources[options.defaultRes]);
        // multiResSources[options.defaultRes].forEach(function(source) {
        //   player.options_.sources.push(source);
        // });
      }
    }
    player.ready(videojs.bind(this, function () {

    }));
  }
  switchResloution(id){
    this.player.src();
  }
}

videojs.registerPlugin('MultiResolution', MultiResolution);

export default MultiResolution;
