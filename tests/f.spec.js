describe('f', function () {
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
