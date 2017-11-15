/**
 * Check if volume control is supported and if it isn't hide the
 * `Component` that was passed  using the `vjs-hidden` class.
 *
 * @param {Component} self
 *        The component that should be hidden if volume is unsupported
 *
 * @param {Player} player
 *        A reference to the player
 *
 * @private
 */
const checkVolumeSupport = function(self, player) {
  // hide volume controls when they're not supported by the current tech
  if (player.tech_ && !player.tech_.featuresVolumeControl && !player.tech_.featuresMuteControl) {
    self.addClass('vjs-hidden');
  } else if (player.tech_ && player.tech_.featuresVolumeControl) {
    self.addClass('enable-volume-control');
  }

  self.on(player, 'loadstart', function() {
    if (!player.tech_.featuresVolumeControl && !player.tech_.featuresMuteControl) {
      self.addClass('vjs-hidden');
    } else if (player.tech_.featuresVolumeControl) {
      self.removeClass('vjs-hidden');
      self.addClass('enable-volume-control');
    }
  });
};

export default checkVolumeSupport;
