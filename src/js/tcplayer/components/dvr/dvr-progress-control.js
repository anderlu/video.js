/**
 * User: anderlu
 * Date: 2017/10/12
 * Time: 9:44
 */
import videojs from '../../../video.js';
import _ from 'lodash';
/**
 * 处理视频时移回看的进度条逻辑，mousemove时显示可以点击或拖拽的时间戳
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
    // console.log('DvrProgressControl move', event);
  }
}
DvrProgressControl.prototype.options_ = {
  children:[
    'DvrSeekBar'
  ]
};
videojs.registerComponent('DvrProgressControl', DvrProgressControl);

/**
 * 滑动条容器
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

  /**
   * 需要在目标点击或者拖拽后更新滑块的位置
   */
  update (){
    // const percent = super.update();
    console.log('DvrSeekBar update');
  }
  /**
   * Handle mouse move on seek bar
   *
   * @param {EventTarget~Event} event
   *        The `mousemove` event that caused this to run.
   *
   * @listens mousemove
   */
  handleMouseMove(event) {
    let newTime = this.calculateDistance(event) * this.player_.duration();
    console.log('DvrSeekBar mouseDown or move', newTime)
  }
}
DvrSeekBar.prototype.options_ = {
  children:[
    'DvrTimeShiftBar'
  ],
  barName: 'DvrTimeShiftBar'
};

videojs.registerComponent('DvrSeekBar', DvrSeekBar);

/**
 * 可拖动的时移进度条
 */
class DvrTimeShiftBar extends Component{
  createEl() {
    return super.createEl('div', {
      className: 'vjs-play-progress vjs-slider-bar tcp-dvr-time-shift',
      innerHTML: `<span class="vjs-control-text"><span>${this.localize('Progress')}</span>: 0%</span>`
    });
  }
  /**
   * Enqueues updates to its own DOM as well as the DOM of its
   * {@link TimeTooltip} child.
   *
   * @param {Object} seekBarRect
   *        The `ClientRect` for the {@link SeekBar} element.
   *
   * @param {number} seekBarPoint
   *        A number from 0 to 1, representing a horizontal reference point
   *        from the left edge of the {@link SeekBar}
   */
  update(seekBarRect, seekBarPoint) {

  }
}
videojs.registerComponent('DvrTimeShiftBar', DvrTimeShiftBar);






