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
    if(options.img){
      this.update({data:options});
    }
  }
  createEl (){
    const el = videojs.dom.createEl('div', {
      className: 'tcp-logo vjs-hidden',
    });
    let linkEl_ = videojs.dom.createEl('a',{
      className: 'tcp-logo-link',
      target: '_blank',
    });
    let imgEl_ = videojs.dom.createEl('img',{
      className: 'tcp-logo-img'
    });
    this.linkEl_ = linkEl_;
    this.imgEl_ = imgEl_;

    linkEl_.appendChild(imgEl_);
    el.appendChild(linkEl_);

    return el;
  }

  /**
   *
   * @param event
   * data:{
   *  img:{url:'', position:['left-top'|'left-bottom'|'right-top'|'right-bottom']}
   *  link:'' // url
   * }
   */
  update(event){
    let img = event.data.img,
        linkUrl = event.data.link;
    this.setImg(img);
    this.setHref(linkUrl);
    this.options_ = videojs.mergeOptions(this.options_, event.data);
    this.show();
  }
  setImg(data) {
    if(this.imgEl_){
      this.imgEl_.src = data.url;
      videojs.dom.addClass(this.el_, data.position || 'left-top');
    }
  }
  setHref(url){
    if(this.linkEl_ && url){
      this.linkEl_.href = url;
    }
  }
}

videojs.registerComponent('LogoImage', LogoImage);
