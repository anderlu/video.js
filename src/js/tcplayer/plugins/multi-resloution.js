import videojs from '../../video.js';

const Plugin = videojs.getPlugin('plugin');
class MultiResloution extends Plugin{
  /**
   *
   * 用于支持传入多种分辨率，依赖 QualitySwitcher 做UI
   * {@link QualitySwitcher}
   *　
   * 通过sources参数传入数据时，检测sources item是否设置了label属性 例如label:720p，
   * 如果设置了label则初始化 MutipleResloution 插件
   * 1. 给sources item 分配id，可直接用数组索引作为id
   * 2.
   */
  constructor(player, options) {
    super(player);


  }
  init() {

  }
  switchResloution(id){

  }
}
export default MultiResloution;
