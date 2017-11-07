import videojs from '../../../video.js';

const MenuButton = videojs.getComponent('MenuButton');

class QualitySwitcherMenuButton extends MenuButton {
  createMenu(){
    const menu = new Menu(this.player());
    //创建item
    console.log(this.options_);
    return menu;
  }
}
