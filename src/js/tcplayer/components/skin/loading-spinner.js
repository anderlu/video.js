import videojs from '../../../video.js';

const Component = videojs.getComponent('Component');
const LoadingSpinner = videojs.getComponent('LoadingSpinner');
LoadingSpinner.prototype.createEl = function(){
  var el = Component.prototype.createEl.call(this, 'div', {
    className: 'tcp-loading-spinner',
    dir: 'ltr'
  });

  return el;
};
