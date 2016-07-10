/*!
 * ::NAME::, v::VERSION_NUMBER:: (::BUILD_DATE::)
 * ::DESCRIPTION::
 * <::HOMEPAGE::>
 *
 * Author: ::AUTHOR:: <::AUTHOR_URL::>
 * License: ::LICENSE::
 * 
 */
(function () {
	
var factory = function (Navigo) {
	"use strict";
	//::f:://
	//::dispatcher:://
	//::injector:://
	//::router:://
	//::core:://
	//::sandbox:://
	//::store:://
	//::extension:://
	//::module:://
    return F;
};

if (typeof define === 'function' && define.amd) {
    define(['Navigo'], factory);
} else if (typeof module !== 'undefined' && module.exports) { //Node
    module.exports = factory(require('Navigo'));
} else {
    /*jshint sub:true */
    window['F'] = factory(window['Navigo']);
}

}());
