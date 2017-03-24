function ActionPayload(type, data) {
    if (typeof type !== 'string') {
        throw new Error('Invalid payload type')
    }

    if (type.length == 0) {
        throw new Error('Invalid payload type length');
    }

    if (typeof data !== 'object') {
        throw new Error('Invalid data type')
    }

    var _type = type,
        _data = data;

    this.getType = function() {
        return _type;
    }

    this.getData = function() {
        return _data;
    }
}
