/**
 * @file logo.js
 */

import videojs from '../../video.js';

/**
 * 在播放器区域显示logo 图片，并支持点击调跳转
 * @extends Component
 */
const Component = videojs.getComponent('Component');
const ClickableComponent = videojs.getComponent('ClickableComponent');

class LogoImage extends ClickableComponent {
  constructor(player, options){
    super(player, options);
    player.on('logochange', videojs.bind(this, this.update));
  }
  createEl (){
    const el = videojs.dom.createEl('div', {
      className: 'tcp-logo',
    });
    this.linkEl_ = videojs.dom.createEl('a',{
      className: 'tcp-logo-link'
    });
    this.imgEl_ = videojs.dom.createEl('img',{
      className: 'tcp-logo-img'
    });
    this.linkEl_.appendChild(this.imgEl_);
    el.appendChild(this.linkEl_);

    return el;
  }
  update(event){
    let imgUrl = event.data.img,
        linkUrl = event.data.link;
    this.setSrc(imgUrl);
    this.setHref(linkUrl);
  }
  setSrc(url) {
    if(this.imgEl_){
      this.imgEl_.src = url;
    }
  }
  setHref(url){
    if(this.linkEl_){
      this.linkEl_.href = url;
    }
  }
}
videojs.registerComponent('LogoImage', LogoImage);
