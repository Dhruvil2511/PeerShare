
let array = [];
let fileSize;
let receivedSize = 0;
self.addEventListener('message', (event) => {
    if (typeof (event.data) === 'number') {
        fileSize = event.data;
    }
    else if (fileSize && typeof (event.data) === 'object') {
        array.push(event.data);
        receivedSize += event.data.byteLength;
        console.log(receivedSize);
        if (receivedSize === fileSize) {
            const file = new Blob(array);
            array = []
            receivedSize = 0;
            self.postMessage(file);
        }
    }
});