/**
 * User: anderlu
 * Date: 2017/10/12
 * Time: 9:44
 */
import videojs from '../../../video.js';
import throttle from 'lodash/throttle';
/**
 * 处理视频时移回看的进度条逻辑，mousemove时显示可以点击或拖拽的时间戳
 * @extends Component
 */
const Component = videojs.getComponent('Component');
class DvrProgressControl extends Component{
  constructor(player, options){
    super(player, options);
    // this.handleMouseMove = _.throttle(this.handleMouseMove.bind(this), 25);
    this.on('mousemove', this.handleMouseMove);
    this.on('mouseup', this.handleMouseUp);
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
  update(percent){
    // console.log('DvrProgressControl update', percent);
    this.getChild('DvrSeekBar').update(percent);
  }
  /**
   * 鼠标在DvrProgressControl上方移动时，获取事件并根据鼠标的相对位置进行计算时间
   */
  handleMouseMove(event){
    // console.log('DvrProgressControl move', event);
    const dvrSeekBar = this.getChild('DvrSeekBar');
    let percent = dvrSeekBar.calculateDistance(event);
    const mouseTimeDisplay = dvrSeekBar.getChild('DvrMouseTimeDisplay');
    if(mouseTimeDisplay){
      mouseTimeDisplay.update(videojs.dom.getBoundingClientRect(dvrSeekBar.el()), percent);
    }
  }
  handleMouseUp(event){
    // console.log('DvrProgressControl mouseup');
    const dvrSeekBar = this.getChild('DvrSeekBar');
    dvrSeekBar.handleMouseUp(event);
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
    this.percent_ = 1;
    this.update = throttle(videojs.bind(this, this.update), 50);
    // this.update = videojs.bind(this, this.update);
    // console.log('DvrSeekBar init vertical:', this.vertical()) // false
    this.on(player, 'seekToLive',videojs.bind(this, function (event) {
      this.update(event.data);
    }));
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
   * 在目标点击或者拖拽后更新滑块的位置
   * 同时更新aria属性值
   * @param {number} percent
   *        取值区间为[0,1]
   */
  update(percent) {
    // const percent = super.update();
    if(percent == undefined){
      return ;
    }
    this.percent_ = percent;
    // console.log('DvrSeekBar update', (percent*100).toFixed(2), window.getComputedStyle(this.el_).height);
    this.bar.update(videojs.dom.getBoundingClientRect(this.el_), percent);
    this.updateAriaAttributes(percent);
  }
  handleMouseDown(event){
    super.handleMouseDown(event);
    this.isMouseDown = true;
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
    // let newTime = this.calculateDistance(event) * this.player_.duration();
    let percent = this.calculateDistance(event);
    // console.log('DvrSeekBar mouseDown or move', this.calculateDistance(event));
    this.update(percent);
  }
  handleMouseUp(event) {
    super.handleMouseUp();
    let percent = this.calculateDistance(event);
    //slider handleMouseUp 会调用 update 方法，但是没有传入参数，会影响DvrSeekBar的update逻辑
    // console.log('DvrSeekBar mouseUp', this.calculateDistance(event));
    this.update(percent);
    //设置时移播放地址
    this.player().Dvr().timeShift(percent);
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
    'DvrMouseTimeDisplay',
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
   *
   * @param {Object} seekBarRect
   *        The `ClientRect` for the {@link SeekBar} element.
   *
   * @param {number} seekBarPoint
   *        A number from 0 to 1, representing a horizontal reference point
   *        from the left edge of the {@link SeekBar}
   */
  update(seekBarRect, seekBarPoint) {
    // console.log('DvrTimeShiftBar', seekBarRect, seekBarPoint);

    const percentage = (seekBarPoint * 100).toFixed(2) + '%';
    const style = this.el_.style;
    style.width = percentage;
  }
}

videojs.registerComponent('DvrTimeShiftBar', DvrTimeShiftBar);


/**
 * 鼠标hover时，显示时间标签
 *
 */
const MouseTimeDisplay = videojs.getComponent('MouseTimeDisplay');
class DvrMouseTimeDisplay extends MouseTimeDisplay{
  update(seekBarRect, seekBarPoint) {
    if (this.rafId_) {
      this.cancelAnimationFrame(this.rafId_);
    }

    this.rafId_ = this.requestAnimationFrame(() => {
      const maxTimeShift = this.player().Dvr().dvrData['maxTimeShift'];
      const content = videojs.formatTime((1-seekBarPoint) * maxTimeShift, maxTimeShift);

      this.el_.style.left = `${seekBarRect.width * seekBarPoint}px`;
      this.getChild('timeTooltip').update(seekBarRect, seekBarPoint, content);
    });
  }
}
videojs.registerComponent('DvrMouseTimeDisplay',DvrMouseTimeDisplay);

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
  update(){

  }
  updateControlText(isLive){
    this.controlText(isLive ? '直播中' : '返回直播');
  }
  handleClick (event) {
    this.player().Dvr().seekToLive();

  }
}
LiveButton.prototype.controlText_= '返回直播';
videojs.registerComponent('LiveButton',LiveButton);
