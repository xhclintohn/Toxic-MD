const { Readable } = require('readable-stream');

globalThis.ReadableStream = Readable;
globalThis.Blob = require('buffer').Blob;

module.exports = {
    createSafeStream: (data) => {
        const stream = new Readable();
        stream.push(data);
        stream.push(null);
        return stream;
    }
};