/**
 * User: anderlu
 * Date: 2017/10/9
 * Time: 16:49
 */
import videojs from '../../../video.js';
import _ from 'lodash';
// import throttle from 'lodash/throttle';
// import get from 'lodash/get';

var maxDelay = 3600 * 2;
var SeekBar = videojs.getComponent('SeekBar');

videojs.registerComponent('DvrSeekBar', videojs.extend(SeekBar, {
  options_: {
    // children: ['dvrLoadProgressBar', 'dvrMouseTimeDisplay', 'dvrPlayProgressBar'],
    children: ['dvrPlayProgressBar'],
    barName: 'dvrPlayProgressBar'
  },
  getPercent: function(){

  },
  handleMouseMove: function(event){

  },
  updateAriaAttributes: function(el){
    el.setAttribute('aria-valuenow', (this.getPercent() * 100).toFixed(2));
    el.setAttribute('aria-valuetext', this.player_.dvr.format_time());
  },
}));

var PlayProgressBar = videojs.getComponent('PlayProgressBar');
videojs.registerComponent('DvrPlayProgressBar', videojs.extend(PlayProgressBar, {

}));

function el_pos(el){
  var box;
  if (el.getBoundingClientRect && el.parentNode) {
    box = el.getBoundingClientRect();
  } else {
    return 0;
  }
  var body = document.body;
  var client = document.documentElement.clientLeft || body.clientLeft || 0;
  var scroll = window.pageXOffset || body.scrollLeft;
  return Math.round(box.left + scroll - client);
}

var LoadProgressBar = videojs.getComponent('LoadProgressBar');
videojs.registerComponent('DvrLoadProgressBar', videojs.extend(LoadProgressBar, {
  constructor: function(player, options){
    LoadProgressBar.call(this, player, options);
    this.partEls_ = [];
    var flashls;
    if (player.tech_.hls_obj)
      this.on(player.tech_.hls_obj, 'hlsLevelUpdated', this.update);
    else if (flashls = player.tech_.flashlsProvider)
    {
      this.on(player, 'timeupdate', function(){
        this.update(flashls.buffer);
      });
    }
  },
  update: function(buffer){
    var percentify = function(time, end){
      var percent = time / end || 0;
      return (percent >= 1 ? 1 : percent) * 100 + '%';
    };
    var range = this.player_.dvr.range();
    var start = range ? range.start : 0;
    var end = range ? range.end : 0;
    var children = this.partEls_;
    var buff = [];
    var i;
    if (buffer)
    {
      var cur = this.player_.currentTime();
      buff = [{start: cur, end: cur+buffer}];
    }
    else
    {
      var buffered = this.player_.buffered();
      for (i = 0; i < buffered.length; i++)
      {
        if (buffered.end(i)<=start || buffered.start(i)>=end)
          continue;
        buff.push({
          start: Math.max(buffered.start(i), start),
          end: Math.min(buffered.end(i), end),
        });
      }
    }
    var total = buff.length ? buff[buff.length-1].end - start : 0;
    this.el_.style.width = percentify(total, end-start);
    for (i = 0; i < buff.length; i++)
    {
      children[i] = children[i] || this.el_.appendChild(videojs.dom.createEl());
      var part = children[i];
      part.style.left = percentify(buff[i].start-start, total);
      part.style.width = percentify(buff[i].end-buff[i].start, total);
    }
    for (i = children.length; i > buff.length; i--)
      this.el_.removeChild(children[i-1]);
    children.length = buff.length;
  },
}));

// var Button = videojs.getComponent('Button');
// videojs.registerComponent('LiveButton', videojs.extend(Button, {
//   controlText_: 'Skip back to live',
//   createEl: function(){
//     var el = Button.prototype.createEl.call(this, 'button', {
//       className: 'vjs-live-control vjs-control',
//     });
//     this.contentEl_ = videojs.dom.createEl('div', {
//       className: 'vjs-live-display',
//       innerHTML: this.localize('LIVE'),
//     }, {
//       'aria-live': 'off',
//     });
//     el.appendChild(this.contentEl_);
//     return el;
//   },
//   handleClick: function(){
//     this.player_.dvr.seek_to_live();
//     this.player_.play();
//   }
// }));

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
  handleClick () {
    this.player_.dvr.seek_to_live();
    this.player_.play();
  }
}
LiveButton.prototype.controlText_= 'Skip back to live';
videojs.registerComponent('LiveButton',LiveButton);
