import videojs from '../../../video.js';

const Menu = videojs.getComponent('Menu');

class QualitySwitcherMenu extends Menu{
  addItem(component) {
    super.addItem(component);
    //更新非选中项的状态
    /*component.on(['tap', 'click'], () => {
      let children = this.children();
      for (var i=0; i < children.length; i++) {
        var child = children[i];
        if (component !== child) {
          child.selected(false);
          child.options_.selected = false;
        }else{
          //选中
          child.options_.selected = true;
        }
      }
    });*/
  }
}

export default QualitySwitcherMenu;
