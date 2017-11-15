import videojs from '../../../video.js';

const MenuItem = videojs.getComponent('MenuItem');

class QualitySwitcherMenuItem extends MenuItem {
  constructor(player, options){
   super(player, options);
   // console.log('QualitySwitcherMenuItem', options);
  }
  handleClick(event){
    super.handleClick(event);
    //需要调用对应quality的回调函数
    //options 包含的值在 QualitySwitcherMenuButton 传入
    this.options_.callback(this.options_.id);
    if(this.options_.trackType == 'video'){
      this.player().controlBar.getChild(this.options_.trackType + 'QualitySwitcherMenuButton').updateLabel(this.options_);
    }
  }
}

export default QualitySwitcherMenuItem;
