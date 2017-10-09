/**
 * User: anderlu
 * Date: 2017/10/9
 * Time: 16:49
 */
import videojs from '../video.js';
import '../components/dvr/dvr-seek-bar.js'

const Plugin = videojs.getPlugin('plugin');

class Dvr extends Plugin{
  constructor(player){
    super(player);

    function init(){
      var hls = player.tech_.hls_obj;
      var flashls = player.tech_.flashlsProvider;
      var seekable = player.seekable();
      if (!hls && !flashls || player.duration()!=Infinity || !seekable ||
        !seekable.length || (seekable.end(0)-seekable.start(0))<60)
      {
        return;
      }
      var progressControl = player.controlBar.progressControl;
      remove_child(progressControl, 'seekBar');
      progressControl.seekBar = progressControl.addChild('DvrSeekBar');
      remove_child(player.controlBar, 'liveDisplay');
      player.controlBar.addChild('LiveButton');
      player.addClass('vjs-dvr');
      if (!player.hasStarted()) {
        player.one('play', function () {
          player.dvr.seek_to_live();
        });
      }
      player.on('timeupdate', function(){
        player.toggleClass('vjs-dvr-live', player.dvr.is_live());
      });
      if (flashls){
        player.dvr.live_threshold = Math.max(flashls.avg_duration*1.5, 10);
      } else {
        hls.on('hlsLevelUpdated', function(e, data){
          player.dvr.live_threshold =
            Math.max(data.details.targetduration*1.5, 10);
        });
      }
    }

    player.ready(function(){
      var seekable = player.seekable();
      if (player.duration() && seekable && seekable.length)
        init();
      else
        player.one('loadedmetadata', function(){
          if (!player.tech_.flashlsProvider)
          {
            init();
            return;
          }
          player.on('timeupdate', function on_timeupdate(){
            var seekable = player.seekable();
            if (!seekable || !seekable.length)
              return;
            player.off('timeupdate', on_timeupdate);
            init();
          });
        });
    });

    player.dvr = {
      live_threshold: 10,
      range: function(){
        var seekable = player.seekable();
        return seekable && seekable.length ?
          {start: seekable.start(0), end: seekable.end(0)} : null;
      },
      is_live: function(){
        var range = this.range();
        var end = range && range.end;
        return end && (end-player.currentTime()) <= this.live_threshold;
      },
      format_time: function(time){
        var range = this.range();
        if (!range)
          return '0:00';
        if (!time)
        {
          time = player.scrubbing() ? player.getCache().currentTime :
            player.currentTime();
        }
        if (range.end-time < this.live_threshold)
          return player.localize('Live');
        time = Math.max(range.end-time, 0);
        return (time > 0 ? '-' : '')+vjs.formatTime(time, range.end);
      },
      seek_to_live: function(){
        var range = this.range();
        if (range && !this.is_live())
          player.currentTime(range.end);
      },
    };
  }
  init(){
    var player = this.player;
    var hls = player.tech_.hls_obj;
    var flashls = player.tech_.flashlsProvider;
    var seekable = player.seekable();
    if (!hls && !flashls || player.duration()!=Infinity || !seekable || !seekable.length || (seekable.end(0)-seekable.start(0))<60) {
      return;
    }
    var progressControl = player.controlBar.progressControl;
    remove_child(progressControl, 'seekBar');
    progressControl.seekBar = progressControl.addChild('DvrSeekBar');
    remove_child(player.controlBar, 'liveDisplay');
    player.controlBar.addChild('LiveButton');
    player.addClass('vjs-dvr');
    if (!player.hasStarted()) {
      player.one('play', function () {
        player.dvr.seek_to_live();
      });
    }
    player.on('timeupdate', function(){
      player.toggleClass('vjs-dvr-live', player.dvr.is_live());
    });
    if (flashls){
      player.dvr.live_threshold = Math.max(flashls.avg_duration*1.5, 10);
    }
    else{
      hls.on('hlsLevelUpdated', function(e, data){
        player.dvr.live_threshold =
          Math.max(data.details.targetduration*1.5, 10);
      });
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
