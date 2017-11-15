import videojs from '../../video.js';
import QualitySwitcherMenuButton from '../components/quality-switcher/quality-switcher-menu-button';

const Plugin = videojs.getPlugin('plugin');
const TRACK_TYPES = ["video", "audio", "subtitle"];
const TRACK_CLASS = {
  video: 'tcp-video-quality-switcher',
  audio: 'tcp-audio-quality-switcher',
  subtitle: 'tcp-subtitle-quality-switcher'
};

class QualitySwitcher extends Plugin{
  /**
   * Hls质量平滑切换，依赖hls.js
   * 普通视频质量切换
   * 音频质量切换
   *
   * 1.在播放hls时，并解析到master playlist后初始化
   * 2.在palyer初始化传入多个source，并设置了多清晰度的参数时，进行初始化
   *
   * 初始化：分辨率切换按钮和菜单
   * 切换清晰度时的回调函数
   * hls的回调
   * 普通切换的回调
   *
   */
  constructor(player, options) {
    super(player);
    let self = this,
        tech = this.player.tech(true);
    this.init = videojs.bind(this,this.init);
    // console.log('new QualitySwitcher',player, this, options);
    //注册事件，当触发load quality data时进行初始化
    if(tech){
      tech.on('loadedqualitydata', this.init);
    }else{
      player.ready(function(){
        // console.log('QualitySwitcher on ready', options);
        tech = self.player.tech(true);
        tech.on('loadedqualitydata', self.init);
      });
    }
  }

  /**
   * 初始化 switcher
   * @param event
   * event.data
   * ｛
   *    qualityData：｛
   *      'video':[{
   *        'id': String
   *        'label': String
   *        'selected': Boolean
   *      },{...}],
   *      'audio:[{...},...]
   *      'subtitle':[{...},...]
   *    ｝
   *    callbacks：｛
   *      'video': function,
   *      'audio': function,
   *      'subtitle': function
   *    ｝
   * ｝
   */
  init(event){
    console.log('QualitySwitcher init ',event);
    let player = this.player,
        qualityData = event.data.qualityData,
        callbacks = event.data.callbacks;
    //分别创建 video audio subtitle的switch
    for (let i=0; i<TRACK_TYPES.length; i++) {
      let track = TRACK_TYPES[i],
          //name 用于区分是哪种选择器，在item 被选中后,item根据name通知控件更新状态
          name = track + 'QualitySwitcherMenuButton',
          qualitySwitcherMenuButton = player.controlBar.getChild(name);

      if (qualitySwitcherMenuButton) {
        qualitySwitcherMenuButton.dispose();
        player.controlBar.removeChild(qualitySwitcherMenuButton);
      }

      if (qualityData[track] && qualityData[track].length > 1) {
        qualitySwitcherMenuButton = new QualitySwitcherMenuButton(player, {name, qualityList: qualityData[track], callback: callbacks[track], trackType: track});
        qualitySwitcherMenuButton.addClass(TRACK_CLASS[track]);
        player.controlBar.addChild(qualitySwitcherMenuButton,{}, 10);
      }
    }
  }
}

videojs.registerPlugin('QualitySwitcher', QualitySwitcher);

export default QualitySwitcher;
