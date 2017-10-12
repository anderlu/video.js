/**
 * User: anderlu
 * Date: 2017/10/12
 * Time: 9:44
 */
import videojs from '../../../video.js';
import _ from 'lodash';
/**
 * 处理直播回看视频的进度条逻辑，mousemove时显示可以点击或拖拽的时间戳
 * @extends Component
 */
const Component = videojs.getComponent('Component');
class DvrProgressControl extends Component{
  constructor(player, options){
    super(player, options);
    this.handleMouseMove = _.throttle(this.handleMouseMove.bind(this), 25);
    this.on(this.el_, 'mousemove', this.handleMouseMove);

  }
  /**
   * Create the `Component`'s DOM element
   *
   * @return {Element}
   *         The element that was created.
   */
  createEl() {
    return super.createEl('div', {
      className: 'vjs-progress-control vjs-control tcp-dvr-progress-control'
    });
  }
  /**
   * 鼠标在DvrProgressControl上方移动时，获取事件并根据鼠标的相对位置进行计算时间
   */
  handleMouseMove(event){

  }
}
DvrProgressControl.prototype.options_ = {
  children:[
    'DvrSeekBar'
  ]
};
videojs.registerComponent('DvrProgressControl', DvrProgressControl);

/**
 * 滑动条
 * @extends Slider
 */
var Slider = videojs.getComponent('Slider');
class DvrSeekBar extends Slider {
  constructor(player, options) {
    super(player, options);
    this.update = _.throttle(this.update.bind(this), 50);
  }
  /**
   * Create the `Component`'s DOM element
   *
   * @return {Element}
   *         The element that was created.
   */
  createEl() {
    return super.createEl('div', {
      className: 'vjs-progress-holder'
    }, {
      'aria-label': this.localize('Progress Bar')
    });
  }
  update (){

  }
}
DvrSeekBar.prototype.options_ = {
  children:[
    'DvrPlayProgressBar'
  ],
  barName: 'DvrPlayProgressBar'
};

videojs.registerComponent('DvrSeekBar', DvrSeekBar);

/**
 * DvrPlayProgressBar
 */
class DvrPlayProgressBar extends Component{
  createEl() {
    return super.createEl('div', {
      className: 'vjs-play-progress vjs-slider-bar tcp-dvr-play-progress',
      innerHTML: `<span class="vjs-control-text"><span>${this.localize('Progress')}</span>: 0%</span>`
    });
  }
  update(seekBarRect, seekBarPoint) {

  }
}
videojs.registerComponent('DvrPlayProgressBar', DvrPlayProgressBar);






