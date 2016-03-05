/**
 * Extension
 *
 * `Extension`s augment the capabilities of the `Core`.
 */

F.Extension = (function(undefined){
    "use strict";

    function Extension () {}

    // Attach all inheritable methods to the Extension prototype.
    F.compose(Extension.prototype, {

        /**
         * Init is an empty function by default. Override with your own logic.
         * @return {void}
         */
        init: function(options) {
            this._defaults = {};
            this._options = $.extend( {}, this._defaults, options );
        }
    });

    Extension.extend = F.extend;
    return Extension;
}());
