describe('f', function () {

    describe('noConflict', function(){
        it('should return the previous F', function(){
            expect(F.noConflict()).toBe(F);
        })
    });

    describe('compose', function() {
        it('should compose objects', function(){
            obj = { a: 1, b: function(){} };
            newObj = F.compose({}, obj);
            expect(newObj).toEqual(obj);
        });
    });

    describe('extend', function(){
        function Parent(){
            var self = this;

            this.constructor = function(){
                self.createTime = new Date();
            }

            this.getClassName = function(){
                return 'parent';
            }

            self.getCreateTime = function(){
                return self.createTime;
            }
        }

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
        })


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
        it('should throw exception if condition is falsy', function () {
            expect(function(){ F.guardThat(1<0)}).toThrow();
        });

        it('should throw exception if condition is falsy with given message', function () {
            var errorMessage = "error message";
            expect(function(){ F.guardThat(1 < 0, errorMessage)}).toThrowError(errorMessage);
        });

        it('should not throw exception if condition is truthy', function () {
            expect(function(){ F.guardThat(1 > 0)}).not.toThrow();
        });
    });
});
