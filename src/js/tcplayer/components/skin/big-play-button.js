/**
 * User: anderlu
 * Date: 2017/10/26
 * Time: 19:48
 */
import videojs from '../../../video.js';

var play_button_svg = '<svg height="100%" width="100%" viewBox="0 14 96 68">'
  +'<path d="M96,44.3v7.3c-0.1,7.7-1,15.5-1,15.5s-0.9,6.6-3.8,9.5c-3.6,3.8-'
  +'7.7,3.8-9.6,4c-13.4,1-33.5,0.9-33.5,0.9 c-0.8,0-25-0.2-32.5-0.9c-2.1-0.4'
  +'-6.9-0.3-10.6-4.1c-2.9-2.9-3.8-9.5-3.8-9.5s-1-7.7-1.1-15.5v-7.3c0.2-7.8,'
  +'1.1-15.5,1.1-15.5 s0.9-6.6,3.8-9.5c3.6-3.8,7.7-3.8,9.6-4.1c13.4-1,33.5-'
  +'0.9,33.5-0.9s20.1-0.1,33.5,0.9c1.9,0.2,5.9,0.2,9.6,4.1 c2.9,2.9,3.8,9.5,'
  +'3.8,9.5S95.9,36.6,96,44.3z M38.3,61.4L64,47.9L38.3,34.4V61.4z"/>'
  +'<polygon points="64,47.9 38.3,61.4 38.3,34.4" fill="#fff"/>'
  +'</svg>';
const Button = videojs.getComponent('Button');
const BigPlayButton = videojs.getComponent('BigPlayButton');
BigPlayButton.prototype.createEl = function(){
  var el = Button.prototype.createEl.call(this);
  el.appendChild(videojs.dom.createEl('div', {
    className: 'vjs-button-icon',
    innerHTML: play_button_svg,
  }));
  return el;
};
