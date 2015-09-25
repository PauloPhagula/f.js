/*
TLDR: Save yourself from headaches and just use Harmony (ES6), Typescript or FB flow classes

Class emulation library / Pseudo-Classical Inheritance
Javascript is a prototype language, and as such doesn't include a native class implementation (ES6 has but we're using ES5)

Rather than class defitions, JavaScript has constructor functions and the new operator.
A constructor function can specify an object's initial properties and values when it is intantiated. Any JavaScript function
can be considered a constructor. Use the new operator with a constructor function to create a new instance.

---
Everything in JavaScript is an object and objects are plain and simple dictionaries (or hashes as commonly said)
That means, we can access and set their properties with an index or using the dot operator
Ex:
a = {} // create and empty object/hash
a['b'] = 1; // assign a value to and index
a.b = 1 // access that value using the dot operator

delete a['b'] // delete the added index
---
Adding [static] class functions to a constructor is the same as adding a property to an object.
Ex:
Person.find = function(id){ ... }
var person = Person.find(1);

To add instance functions to a constructor is the same as adding them to the constructors prototype
Ex:
Person.prototype.run = function(){...}
var person = new Person();
person.run();
---
To inherit from another class, is to make the descendants class prototype equal to the parents prototype.
because that way we can call the parent's methods (through the prototype)
Ex:
var Animal = function(speciesName){

}

var Person = function(name){...}
Person.prototype = new Animal();
---------
Prototypa way
var obj = Object.create(Constructor.prototype);

if(typeof Object.create !== 'function'){
  Object.create = function(proto){
    function F(){};
    F.prototype = proto;
    return new();
  }
}
*/


var Class = function(parent){
	var klass = function(){
		this.init.apply(this, arguments)
	}

	// change klass' prototype
	if(parent){
		var subclass = function(){}
		subclass.prototype = parent.prototype;
		klass.prototype = new subclass;
	}

	klass.prototype.init = function(){};

	// Shortcuts
	klass.fn = klass.prototype;
	klass.fn.parent = klass;
	klass._super = klass.__proto__;

	// Adding class properties
	klass.extend = function(obj){
		var extended = obj.extended;
		for(var i in obj){
			if(obj.hasOwnProperty(i)){
				klass[i] = obj[i];
			}
		}

		// call extended callback
		if (extended) extended(klass);
	}

	// Adding Instance Properties
	klass.include = function(obj){
		var included = obj.included;
		for(var i in obj){
			klass.fn[i] = obj[i];
		}
		if (included) included(klass);
	}

	return klass;
};

var ORM = {
	save: function(){}
}

var Person = new Class;

Person.prototype.init = function(){
	// Called on Person instantiation;
};

// Usage:
Person.include(ORM);
var person = new Person;

/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
// Taken from: http://ejohn.org/blog/simple-javascript-inheritance
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

  // The base Class implementation (does nothing)
  this.Class = function(){};

  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;

    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;

    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;

            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];

            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);
            this._super = tmp;

            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }

    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }

    // Populate our constructed prototype object
    Class.prototype = prototype;

    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;

    return Class;
  };
})();


// --------
// Object.create support test, and fallback for browsers without it
if ( typeof Object.create !== 'function' ) {
    Object.create = function (o) {
        function F() {}
        F.prototype = o;
        return new F();
    };
}

function extend(child, parent){
  child.prototype = inherit(parent.prototype);
  child.prototype.constructor = child;
  child.prototype.super = parent.prototype;
}

function inherit(proto){
  function F(){}
  F.prototype = proto;
  return new F();
}

/*
  Base.js, version 1.1a
  Copyright 2006-2010, Dean Edwards
  License: http://www.opensource.org/licenses/mit-license.php
*/

var Base = function() {
  // dummy
};

Base.extend = function(_instance, _static) { // subclass
  var extend = Base.prototype.extend;

  // build the prototype
  Base._prototyping = true;
  var proto = new this;
  extend.call(proto, _instance);
  proto.base = function() {
    // call this method from any other method to invoke that method's ancestor
  };
  delete Base._prototyping;

  // create the wrapper for the constructor function
  //var constructor = proto.constructor.valueOf(); //-dean
  var constructor = proto.constructor;
  var klass = proto.constructor = function() {
    if (!Base._prototyping) {
      if (this._constructing || this.constructor == klass) { // instantiation
        this._constructing = true;
        constructor.apply(this, arguments);
        delete this._constructing;
      } else if (arguments[0] != null) { // casting
        return (arguments[0].extend || extend).call(arguments[0], proto);
      }
    }
  };

  // build the class interface
  klass.ancestor = this;
  klass.extend = this.extend;
  klass.forEach = this.forEach;
  klass.implement = this.implement;
  klass.prototype = proto;
  klass.toString = this.toString;
  klass.valueOf = function(type) {
    //return (type == "object") ? klass : constructor; //-dean
    return (type == "object") ? klass : constructor.valueOf();
  };
  extend.call(klass, _static);
  // class initialisation
  if (typeof klass.init == "function") klass.init();
  return klass;
};

Base.prototype = {
  extend: function(source, value) {
    if (arguments.length > 1) { // extending with a name/value pair
      var ancestor = this[source];
      if (ancestor && (typeof value == "function") && // overriding a method?
        // the valueOf() comparison is to avoid circular references
        (!ancestor.valueOf || ancestor.valueOf() != value.valueOf()) &&
        /\bbase\b/.test(value)) {
        // get the underlying method
        var method = value.valueOf();
        // override
        value = function() {
          var previous = this.base || Base.prototype.base;
          this.base = ancestor;
          var returnValue = method.apply(this, arguments);
          this.base = previous;
          return returnValue;
        };
        // point to the underlying method
        value.valueOf = function(type) {
          return (type == "object") ? value : method;
        };
        value.toString = Base.toString;
      }
      this[source] = value;
    } else if (source) { // extending with an object literal
      var extend = Base.prototype.extend;
      // if this object has a customised extend method then use it
      if (!Base._prototyping && typeof this != "function") {
        extend = this.extend || extend;
      }
      var proto = {toSource: null};
      // do the "toString" and other methods manually
      var hidden = ["constructor", "toString", "valueOf"];
      // if we are prototyping then include the constructor
      var i = Base._prototyping ? 0 : 1;
      while (key = hidden[i++]) {
        if (source[key] != proto[key]) {
          extend.call(this, key, source[key]);

        }
      }
      // copy each of the source object's properties to this object
      for (var key in source) {
        if (!proto[key]) extend.call(this, key, source[key]);
      }
    }
    return this;
  }
};

// initialise
Base = Base.extend({
  constructor: function() {
    this.extend(arguments[0]);
  }
}, {
  ancestor: Object,
  version: "1.1",

  forEach: function(object, block, context) {
    for (var key in object) {
      if (this.prototype[key] === undefined) {
        block.call(context, object[key], key, object);
      }
    }
  },

  implement: function() {
    for (var i = 0; i < arguments.length; i++) {
      if (typeof arguments[i] == "function") {
        // if it's a function, call it
        arguments[i](this.prototype);
      } else {
        // add the interface using the extend method
        this.prototype.extend(arguments[i]);
      }
    }
    return this;
  },

  toString: function() {
    return String(this.valueOf());
  }
});
