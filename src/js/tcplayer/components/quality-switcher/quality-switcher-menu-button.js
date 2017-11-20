import videojs from '../../../video.js';
import QualitySwitcherMenu from './quality-switcher-menu.js';
import QualitySwitcherMenuItem from './quality-switcher-menu-item.js';

const MenuButton = videojs.getComponent('MenuButton');
const Menu = videojs.getComponent('Menu');

class QualitySwitcherMenuButton extends MenuButton {
  createEl() {
    const el = super.createEl();
    this.labelEl_ = videojs.dom.createEl('div', {
      className: 'tcp-quality-switcher-value',
      innerHTML: ''
    });

    el.appendChild(this.labelEl_);

    return el;
  }
  createMenu(){
    let qualityList = this.options_.qualityList,
        menu = new QualitySwitcherMenu(this.player(), { 'name': this.options_.trackType + 'QualitySwitcherMenu' }),
        options;
    //创建item
    // console.log('createMenu QualitySwitcherMenuButton',this.options_);
    for(let i=qualityList.length-1; i > -1 ; i--){
      let qualityItem = qualityList[i];
      options = videojs.mergeOptions(qualityItem, {
        // 'name': qualityItem.label,
        'trackType': this.options_.trackType,
        'callback': this.options_.callback,
        'selectable': true
      });
      menu.addItem(new QualitySwitcherMenuItem(this.player(), options));
      if(qualityItem.selected){
        this.updateLabel(qualityItem);
      }
    }
    return menu;
  }
  updateLabel(data) {
    this.labelEl_.innerHTML = '<p>'+data.label+'</p>';
  }
}

export default QualitySwitcherMenuButton;
