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
    // this.handleMouseMove = _.throttle(this.handleMouseMove.bind(this), 25);
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
 * 时移滑动条容器
 * @extends Slider
 */
var Slider = videojs.getComponent('Slider');
class DvrSeekBar extends Slider {
  constructor(player, options) {
    super(player, options);
    this.percent_ = 100;
    this.update = _.throttle(this.update.bind(this), 50);
    console.log('DvrSeekBar init vertical:', this.vertical())
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
   *
   * @param {number} percent
   *        取值区间为[0,1]
   */
  update(percent) {
    // const percent = super.update();
    if(percent == undefined){
      return ;
    }
    this.percent_ = percent;
    console.log('DvrSeekBar update', percent);
    this.bar.update(videojs.dom.getBoundingClientRect(this.el_), percent);
    this.updateAriaAttributes(percent);
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
    console.log('DvrSeekBar mouseDown or move', this.calculateDistance(event));
    this.update(this.calculateDistance(event));
  }
  handleMouseUp(event) {
    //slider handleMouseUp 会调用 update 方法，但是没有传入参数，会影响DvrSeekBar的update逻辑
    super.handleMouseUp();
    console.log('DvrSeekBar mouseUp', this.calculateDistance(event));
    this.update(this.calculateDistance(event));

    //设置播放地址
  }
  stepBack() {

  }
  stepForward() {

  }
  updateAriaAttributes(percent){
    let el = this.el();
    el.setAttribute('aria-valuenow', (percent * 100).toFixed(2));
  }
  getPercent(){
    return this.percent_;
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
 * @extends Component
 */
class DvrTimeShiftBar extends Component{
  constructor(player, options) {
    super(player, options);
    this.el_.style.width = '100%';
  }
  createEl() {
    return super.createEl('div', {
      className: 'vjs-play-progress vjs-slider-bar tcp-dvr-time-shift',
      innerHTML: `<span class="vjs-control-text"><span>${this.localize('Progress')}</span>: 100%</span>`
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
    console.log('DvrTimeShiftBar', seekBarRect, seekBarPoint);

    const percentage = (seekBarPoint * 100).toFixed(2) + '%';
    const style = this.el_.style;
    style.width = percentage;
  }
}
videojs.registerComponent('DvrTimeShiftBar', DvrTimeShiftBar);

/**
 * 返回直播视频按钮
 *  @extends Button
 */
const Button = videojs.getComponent('Button');
class LiveButton extends Button{
  createEl () {
    var el = Button.prototype.createEl.call(this, 'button', {
      className: 'vjs-live-control vjs-control',
    });
    this.contentEl_ = videojs.dom.createEl('div', {
      className: 'vjs-live-display',
      innerHTML: this.localize('LIVE'),
    }, {
      'aria-live': 'off',
    });
    el.appendChild(this.contentEl_);
    return el;
  }
  handleClick (event) {
    // this.player_.dvr.seek_to_live();
    // this.player_.play();
  }
}
LiveButton.prototype.controlText_= 'Skip back to live';
videojs.registerComponent('LiveButton',LiveButton);




