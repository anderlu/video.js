/**
 * Hls质量平滑切换依赖hls.js
 * 普通视频质量切换
 * 音频质量切换
 *
 */
import videojs from '../../video.js';
import QualitySwtichMenuButton from '../components/quality-switcher/quality-switcher-menu-button';
const Plugin = videojs.getPlugin('plugin');
const SUPPORTED_TRACKS = ["video", "audio", "subtitle"];
const TRACK_CLASS = {
  video: 'vjs-icon-hd',
  audio: 'vjs-icon-cog',
  subtitle: 'vjs-icon-subtitles'
};
class QualitySwitcher extends Plugin{
  /**
   * 1.在播放hls时，并解析到master playlist后初始化
   * 2.在palyer初始化传入多个source，并设置了多清晰度的参数时，进行初始化
   *
   * 初始化：分辨率切换按钮和菜单
   * 切换清晰度时的回调函数
   * hls的回调
   * 普通切换的回调
   */
  constructor(player){
    super(player);
    //注册事件，当触发load quality data时进行初始化
    let tech = this.player.tech(true);
    this.init = videojs.bind(this,this.init);
    tech.on('loadedqualitydata', this.init);
  }

  init(event, data){
    let player = this.player;
    let qualitySwitcherMenuButton = player.getChild('QualitySwtichMenuButton');
    if(!qualitySwitcherMenuButton){
      //创建menu button
      qualitySwitcherMenuButton = new QualitySwitcherMenuButton(player, {});
      player.controlBar.addChild(qualitySwitcherMenuButton);
    }else{

    }
  }

}

videojs.registerPlugin('QualitySwitcher', QualitySwitcher);
