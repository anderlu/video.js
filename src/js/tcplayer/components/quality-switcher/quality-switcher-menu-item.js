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
    this.options_.callback(this.options_.id);
  }
}

export default QualitySwitcherMenuItem;
