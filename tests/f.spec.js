describe('f', function () { 'use strict';

    describe('noConflict', function(){
        it('should return the previous F', function(){
            expect(F.noConflict()).toBe(F);
        })
    });

    describe('compose', function() {
        it('should compose objects', function(){
            var obj = { a: 1, b: function(){} };
            var newObj = F.compose({}, obj);
            expect(newObj).toEqual(obj);
        });
    });

    describe('extend', function(){
        function Parent(){
            var self = this;

            this.constructor = function(){
                self.createTime = new Date();
            }
        }

        Parent.prototype.getClassName = function(){
            return 'parent';
        };

        Parent.prototype.getCreateTime = function(){
            return this.createTime;
        };

        Parent.extend = F.extend;

        var Child = Parent.extend(
            {
                getClassName : function() {
                    return 'child';
                }
            },
            {
                staticMethod: function() {
                    return 'static';
                }
            }
        );

        var childInstance;

        beforeEach(function(){
            childInstance = new Child();
        });


        it('child objects should inherit properties from parent class', function(){
            expect(childInstance.getCreateTime()).not.toBeNull();
        });

        it('child class should override parent class methods when defined with same name', function(){
            expect(childInstance.getClassName()).toBe('child');
        });

        it('child class should add static methods', function(){
            expect(Child.staticMethod()).toBe('static');
        });

    });

    describe('guardThat', function(){
        it('should throw exception if condition is not boolean', function () {
            expect(function(){ F.guardThat(1); }).toThrow();
        });

        it('should throw exception if condition is not string', function () {
            expect(function(){ F.guardThat(true, 1); }).toThrow();
        });

        it('should throw exception if condition is falsy', function () {
            expect(function(){ F.guardThat(1 < 0); }).toThrow();
        });

        it('should throw exception if condition is falsy with given message', function () {
            var errorMessage = "error message";
            expect(function(){ F.guardThat(1 < 0, errorMessage); }).toThrowError(errorMessage);
        });

        it('should not throw exception if condition is truthy', function () {
            expect(function(){ F.guardThat(1 > 0); }).not.toThrow();
        });
    });
});
