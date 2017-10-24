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
      //在获取到m3u8后开始初始化 hlsManifestLoaded
      player.tech_.on('hlsLevelLoaded', function (event) {
        // console.log('hlsLevelLoaded', event);
      });
      if (player.duration() && seekable && seekable.length){
        self.init();
      }else{
        player.one('loadedmetadata', function(event){
          console.log('loadedmetadata', event);
          player.tech_.el_.setAttribute('poster','');
          if (!player.tech_.flashlsProvider) {
            self.init();
            return;
          }
        });
      }

      //networkError 触发后需要回到直播状态
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

    remove_child(player.controlBar, 'ProgressControl');
    let control = player.controlBar.addChild('DvrProgressControl', {}, 5);
    remove_child(player.controlBar, 'LiveDisplay');
    player.controlBar.addChild('LiveButton');
    player.addClass('vjs-dvr');

  }
  seekToLive (){
    console.log('seekToLive', this.player);
    this.timeShit(1);
    this.player.trigger({ type: 'seekToLive', data: 1 });
  }

  /**
   *
   * @param percent 时移百分比
   *        [0,1]，当值为0时，时移最大值，值为1时，不时移
   */
  timeShit(percent){
    let player = this.player;
    let source = player.tech_.currentSource_;
    // console.log('timeShit', this.player.tech_.currentSource_);
    // console.log('timeShit', Math.floor(this.dvrData['maxTimeShift'] * (1-percent)) );
    source.src = source.src.replace(/delay=*(\d+)/,'delay='+Math.floor(this.dvrData['maxTimeShift'] * (1-percent)));
    // console.log('timeShit', source);
    // this.player.tech_.hlsProvider.hls.loadSource(this.player.tech_.currentSource_.src);
    player.src(player.tech_.currentSource_.src);

    player.bigPlayButton.hide();
    player.posterImage.hide();
    player.tech_.one('hlsManifestParsed', videojs.bind(this, function () {
    // player.one('loadedmetadata', videojs.bind(this, function () {
    //     console.log('hlsManifestParsed');
        player.play();
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
    console.log('dvr init', this.dvrData);
  }
}

function remove_child(component, child_name){
  var child = component.getChild(child_name);
  component.removeChild(child);
  child.dispose();
}

videojs.registerPlugin('Dvr', Dvr);

export default Dvr;
