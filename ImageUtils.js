define(function() {

    function ImageUtils() {
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
    }

    ImageUtils.prototype.getImageBlob = function(img) {
        if (!this.canvas.toBlob) console.warn('Browser does not support toBlob');
        return;
        this.context.drawImage(img, 0, 0);
        return new Promise(function(resolve, reject) {
            console.log('starting');
            this.canvas.toBlob(function(blob) {
                console.log('done');
                resolve(blob);
            });
        });
    };

    ImageUtils.prototype.getSendableImageData = function(img) {
        this.canvas.clientWidth = img.width;
        this.canvas.clientHeight = img.height;
        this.context.drawImage(img, 0, 0);
        var data = this.context.getImageData(0, 0, img.width, img.height);
        var sendableData = {
            width : data.width,
            height : data.height,
            data : new Uint8Array(data.data)
        }
        console.log(sendableData.data);
        return sendableData;
    };

    ImageUtils.prototype.createImageFromSendableData = function(data) {
        var imageData = this.createImageData(
            data.width,
            data.height,
            new Uint8ClampedArray(data.data)
        );
        this.context.putImageData(imageData, 0, 0);
        var image = new Image();
        image.src = this.canvas.toDataURL();
        image.width = data.width;
        image.height = data.height;
        return image;
    };

    ImageUtils.prototype.createImageData = function(width, height, data) {
        var imageData = this.context.createImageData(width, height);
        imageData.data.set(data);
        return imageData;
    };

    return ImageUtils;
});
