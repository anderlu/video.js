import videojs from '../../../video.js';

const MenuItem = videojs.getComponent('MenuItem');

class QualitySwitcherMenuButton extends MenuItem {
  handleClick(event){
    super.handleClick(event);
    //需要调用对应quality的回调函数
  }
}
