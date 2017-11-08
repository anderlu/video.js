import videojs from '../../../video.js';
import QualitySwitcherMenu from './quality-switcher-menu.js';
import QualitySwitcherMenuItem from './quality-switcher-menu-item.js';

const MenuButton = videojs.getComponent('MenuButton');
const Menu = videojs.getComponent('Menu');

class QualitySwitcherMenuButton extends MenuButton {
  createEl() {
    const el = super.createEl();
    this.labelEl_ = videojs.dom.createEl('div', {
      className: 'quality-switcher-value',
      innerHTML: ''
    });

    el.appendChild(this.labelEl_);

    return el;
  }
  createMenu(){
    let qualityList = this.options_.qualityList,
        menu = new QualitySwitcherMenu(this.player(), this.options_),
        options;
    //创建item
    // console.log('createMenu QualitySwitcherMenuButton',this.options_);
    for(let i=0; i < qualityList.length; i++){
      options = videojs.mergeOptions(qualityList[i], {
        name: qualityList[i].label,
        trackType: this.options_.trackType,
        callback: this.options_.callback,
        selectable: true
      });
      menu.addItem(new QualitySwitcherMenuItem(this.player(), options));
    }
    return menu;
  }
  updateLabel() {
    this.labelEl_.innerHTML = '';
  }
}

export default QualitySwitcherMenuButton;
