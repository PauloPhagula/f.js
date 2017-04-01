/*!
 * ::NAME::, v::VERSION_NUMBER:: (::BUILD_DATE::)
 * ::DESCRIPTION::
 * <::HOMEPAGE::>
 *
 * Author: ::AUTHOR:: <::AUTHOR_URL::>
 * License: ::LICENSE::
 */
(function (factory) { 'use strict';

    // Establish the root object, `window` (`self`) in the browser, or `global` on the server.
    // We use `self` instead of `window` for `WebWorker` support.
    var root = (typeof self == 'object' && self.self === self && self) ||
            (typeof global == 'object' && global.global === global && global);

    // Set up F appropriately for the environment. Start with AMD.
    if (typeof define === 'function' && define.amd) {
        define(['exports'], function(exports){
            root.F = factory(root, exports)
        });

    // Node.js or CommonJS
    } else if (typeof exports !== 'undefined') {
        factory(root, exports);

    // Browser globals (root is window)
    } else {
        root.F = factory(root, {});
    }

})(function (root, F) { 'use strict';

	//::f:://
	//::injector:://
	//::dispatcher:://
	//::core:://
	//::sandbox:://
	//::module:://

    return F;
});
