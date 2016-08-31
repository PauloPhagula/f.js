/*!
 * ::NAME::, v::VERSION_NUMBER:: (::BUILD_DATE::)
 * ::DESCRIPTION::
 * <::HOMEPAGE::>
 *
 * Author: ::AUTHOR:: <::AUTHOR_URL::>
 * License: ::LICENSE::
 * 
 */
(function () { 'use strict';

var factory = function () {
	//::f:://
	//::injector:://
	//::dispatcher:://
	//::core:://
	//::sandbox:://
	//::module:://
    return F;
};

if (typeof define === 'function' && define.amd) {
    define(factory);
} else if (typeof module !== 'undefined' && module.exports) { //Node
    module.exports = factory();
} else {
    /*jshint sub:true */
    window['F'] = factory();
}

}());
