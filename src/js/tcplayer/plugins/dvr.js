/**
 * 直播时移回看插件，需要实现的内容
 * 1.播放带delay参数的hls地址
 * 2.获取进度条拖拽结果，计算出delay值，更新url参数并播放新的hls地址
 * 3.进度条的拖拽区间，即delay的取值区间
 * 4.与默认的进度条不同，不需要随timeupdate更新
 * 5.
 */
import videojs from '../../video.js';
// import '../components/dvr/dvr-seek-bar.js'
import '../components/dvr/dvr-progress-control.js'
import * as utils from '../utils/utils.js'

const Plugin = videojs.getPlugin('plugin');

/**
 * 时移插件，实现通过进度条控件，控制时移值，
 * Digital video recorder  Live Time Shift
 * delay
 *
 */
class Dvr extends Plugin{
  constructor(player){
    super(player);
    this.isInit = false;
    var self = this;

    player.ready(function(){
      let tech = player.tech(true);
      let hlsProvider = tech && tech.hlsProvider;
      //采用hls.js时可以初始化Dvr组件
      if(hlsProvider && hlsProvider.Hls){
        let Hls = hlsProvider.Hls;
        //在获取到m3u8后开始初始化 hlsManifestLoaded
        tech.one(Hls.Events.MANIFEST_LOADED, function (event) {
          console.log(Hls.Events.MANIFEST_LOADED, event);
        });
        tech.one(Hls.Events.LEVEL_LOADED, function (event) {
          console.log(Hls.Events.LEVEL_LOADED, event);
        });
        //
        player.one('loadedmetadata', function(event){
          console.log('loadedmetadata', event);
          //避免时移切换的时候 video的poster自动显示
          tech.el_.setAttribute('poster','');
          self.init();
          return;
        });
      }
      //networkError 触发后需要回到直播状态
    });
  }
  init() {
    let player = this.player;
    let hlsProvider = player.tech(true).hlsProvider;
    // 可以通过hls的 hlsManifestLoaded事件获取m3u8数据，然而dvr初始化时，hls已经开始加载并触发事件，所以在这里监听hls时间可能达不到预期的目的
    // 解析当前播放的m3u8
    this.parseM3u8(hlsProvider.manifests[0]);
    // 没有检测到必要的参数，退出初始化过程，当再次播放时，按需重新初始化
    if(!this.dvrData['startTime'] && !this.isInit){
      player.one('loadedmetadata', videojs.bind(this, function (event) {
        console.log('loadedmetadata1', this.isInit, hlsProvider);
          this.init();
      }));
      return;
    }
    console.log('init', this);
    this.initControl();
    // 初始时移值
    this.delay = utils.getParams('delay', player.tech_.currentSource_.src) || 0;
    this.updateControl(!this.isLive());
    //当通过player.src切换地址时，仍需要更新状态
    player.on('loadedmetadata', videojs.bind(this, function () {
      console.log('loadedmetadata2', hlsProvider);
      this.parseM3u8(hlsProvider.manifests[0]);
      this.delay = utils.getParams('delay', player.tech_.currentSource_.src) || 0;
      this.updateControl();

    }));
    this.isInit = true;
  }
  initControl(){
    let player = this.player;
    player.addClass('vjs-dvr');
    player.controlBar.getChild('ProgressControl').hide();
    player.controlBar.getChild('LiveDisplay').hide();
    // removeChild(player.controlBar, 'ProgressControl');
    // removeChild(player.controlBar, 'LiveDisplay');
    player.controlBar.addChild('DvrProgressControl', {}, 5);
    player.controlBar.addChild('liveButton', {}, 6);
  }
  updateControl(updateProgress){
    let player = this.player,
        progressControl = player.controlBar.getChild('ProgressControl'),
        liveDisplay = player.controlBar.getChild('LiveDisplay'),
        dvrProgressControl = player.controlBar.getChild('DvrProgressControl'),
        liveButton = player.controlBar.getChild('LiveButton');
    player.toggleClass('vjs-dvr-live', this.isLive());
    liveButton.updateControlText(this.isLive());
    if(updateProgress){
      dvrProgressControl.update(1 - this.delay / this.dvrData.maxTimeShift);
    }
    //是否播放时移hls
    if(this.dvrData['startTime']){
      dvrProgressControl.show();
      liveButton.show();
      progressControl.hide();
      liveDisplay.hide();
    }else{
      //非时移hls
      dvrProgressControl.hide();
      liveButton.hide();
      progressControl.show();
      liveDisplay.show();
    }
  }
  seekToLive (){
    // console.log('seekToLive', this.player);
    if(!this.isLive()){
      this.timeShift(1);
      this.player.trigger({ type: 'seekToLive', data: 1 });
    }
  }
  /**
   * 返回是否是直播中，timshift值等于0
   */
  isLive(){
    return !(this.delay > 0) ;
  }
  /**
   *
   * @param percent 进度条滑块所在位置的百分比
   *        [0,1]，当值为0时，时移最大值，值为1时，不时移
   */
  timeShift(percent){
    let player = this.player,
        liveButton = player.getChild('ControlBar').getChild('LiveButton'),
        source = player.tech_.currentSource_,
        delay = Math.floor(this.dvrData['maxTimeShift'] * (1-percent));
    this.delay = delay;
    source.src = source.src.replace(/delay=*(\d+)/,'delay='+delay);
    // this.player.tech_.hlsProvider.hls.loadSource(this.player.tech_.currentSource_.src);
    player.src(player.tech_.currentSource_.src);

    player.bigPlayButton.hide();
    player.posterImage.hide();
    player.tech_.one('hlsManifestParsed', videojs.bind(this, function () {
    // player.one('loadedmetadata', videojs.bind(this, function () {
    //     console.log('hlsManifestParsed');
        player.play();
        // this.updateControl(false);
      })
    );
  }
  parseM3u8 (string){
    this.dvrData = {};
    // 可以通过hls的 hlsManifestLoaded事件获取m3u8数据，然而dvr初始化时，hls已经开始加载并触发事件，所以在这里监听hls时间可能达不到预期的目的
    // 当前时间戳 - #EXT-TX-TS-START-TIME与#EXT-TX-TS-DURATION比较，选择小的
    // console.log('dvr init', hlsProvider);
    // const TX_TS_START_TIME=/#EXT-TX-TS-START-TIME:*(.+)/;
    // const TX_TS_DURATION_REGEX=/#EXT-TX-TS-DURATION:*(.+)/;
    const LEVEL_PLAYLIST_REGEX_FAST = new RegExp([
      /#EXT-TX-TS-START-TIME:*(.+)/.source,
      /|#EXT-TX-TS-DURATION:*(.+)/.source
    ].join(''), 'g');
    let result ;
    while ((result = LEVEL_PLAYLIST_REGEX_FAST.exec(string)) !== null) {
      if(result[1]){
        //START-TIME 直播开始时间
        this.dvrData['startTime'] = result[1];
      }else if(result[2]){
        //DURATION 直播持续时间，
        this.dvrData['duration'] = result[2];
      }
    }
    if(this.dvrData['startTime']){
      //可回看时移最大值
      this.dvrData['maxTimeShift'] = Math.min(Math.floor( new Date().getTime()/1000 - this.dvrData['startTime']), this.dvrData['duration']);
    }
    // console.log('dvr init', this.dvrData);
  }
}

function removeChild(component, child_name){
  var child = component.getChild(child_name);
  component.removeChild(child);
  child.dispose();
}

videojs.registerPlugin('Dvr', Dvr);

export default Dvr;
