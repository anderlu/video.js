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

const Plugin = videojs.getPlugin('plugin');

class Dvr extends Plugin{
  constructor(player){
    super(player);
    var self = this;

    player.ready(function(){
      var seekable = player.seekable();

      if (player.duration() && seekable && seekable.length){
        self.init();
      }else{
        player.one('loadedmetadata', function(){
          if (!player.tech_.flashlsProvider) {
            self.init();
            return;
          }
        });
      }
    });

    player.dvr = {
      range:[0, 3600*2],
      live_threshold: 10,
      seekToLive: function(){

      },
    };
  }
  init() {
    let player = this.player;
    let hlsProvider = player.tech_.hlsProvider;
    //可以通过hls的 hlsManifestLoaded事件获取m3u8数据，然而dvr初始化时，hls已经开始加载并触发事件，所以在这里监听hls时间可能达不到预期的目的
    this.parseM3u8(hlsProvider.manifests[0]);

    // var flashls = player.tech_.flashlsProvider;
    // var seekable = player.seekable();
    // if (!hls && !flashls || player.duration()!=Infinity || !seekable || !seekable.length || (seekable.end(0)-seekable.start(0))<60) {
    //   return;
    // }
    // var progressControl = player.controlBar.progressControl;
    // remove_child(progressControl, 'seekBar');
    // progressControl.seekBar = progressControl.addChild('DvrSeekBar');
    remove_child(player.controlBar, 'ProgressControl');
    let control = player.controlBar.addChild('DvrProgressControl', {}, 5);
    remove_child(player.controlBar, 'LiveDisplay');
    player.controlBar.addChild('LiveButton');
    player.addClass('vjs-dvr');
    console.log(this);
    // if (!player.hasStarted()) {
    //   player.one('play', function () {
    //     player.dvr.seek_to_live();
    //   });
    // }
    // player.on('timeupdate', function(){
    //   player.toggleClass('vjs-dvr-live', player.dvr.is_live());
    // });
    // if (flashls){
    //   player.dvr.live_threshold = Math.max(flashls.avg_duration*1.5, 10);
    // }
    // else{
    //   hls.on('hlsLevelUpdated', function(e, data){
    //     player.dvr.live_threshold =
    //       Math.max(data.details.targetduration*1.5, 10);
    //   });
    // }
  }
  seekToLive (){
    console.log('seekToLive', this.player);
  }
  parseM3u8 (string){
    this.dvrData = {};
    //可以通过hls的 hlsManifestLoaded事件获取m3u8数据，然而dvr初始化时，hls已经开始加载并触发事件，所以在这里监听hls时间可能达不到预期的目的
    // console.log('dvr init', hlsProvider);
    // const TX_TS_START_TIME=/#EXT-TX-TS-START-TIME:*(.+)/;
    // const TX_TS_DURATION_REGEX=/#EXT-TX-TS-DURATION:*(.+)/;
    const LEVEL_PLAYLIST_REGEX_FAST = new RegExp([
      /#EXT-TX-TS-START-TIME:*(.+)/.source,
      /|#EXT-TX-TS-DURATION:*(.+)/.source
    ].join(''), 'g');
    let result ;
    while ((result = LEVEL_PLAYLIST_REGEX_FAST.exec(string)) !== null) {
      console.log('dvr init', result);
      if(result[1]){
        //START-TIME 直播开始时间
        this.dvrData['startTime'] = result[1];
      }else if(result[2]){
        //DURATION 直播持续时间，可回看时移最大值
        this.dvrData['duration'] = result[2];
      }
    }
  }
}

function remove_child(component, child_name){
  var child = component.getChild(child_name);
  component.removeChild(child);
  child.dispose();
}

videojs.registerPlugin('Dvr', Dvr);

export default Dvr;
