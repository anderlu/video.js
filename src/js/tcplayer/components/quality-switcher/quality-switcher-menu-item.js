import videojs from '../../../video.js';

const MenuItem = videojs.getComponent('MenuItem');

class QualitySwitcherMenuItem extends MenuItem {
  constructor(player, options){
   super(player, options);
   // console.log('QualitySwitcherMenuItem', options);
  }
  handleClick(event){
    super.handleClick(event);
    this.updateItems();
    //需要调用对应quality的回调函数
    //options 包含的值在 QualitySwitcherMenuButton 初始化Item时传入
    this.options_.callback(this.options_);
    if(this.options_.trackType == 'video'){
      this.player().controlBar.getChild(this.options_.trackType + 'QualitySwitcherMenuButton').updateLabel(this.options_);
    }
  }
  /**
   * 更新所有item的选中状态
   */
  updateItems() {
    let menuButton = this.player().controlBar.getChild(this.options_.trackType + 'QualitySwitcherMenuButton'),
      menu = menuButton.getChild(this.options_.trackType + 'QualitySwitcherMenu'),
      children = menu.children();
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      if (this !== child) {
        child.selected(false);
        child.options_.selected = false;
      } else {
        child.options_.selected = true;
      }
    }
  }
}

export default QualitySwitcherMenuItem;
