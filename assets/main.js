var modalContainer = $('#modal');
var image = document.getElementById('image');
var statusContainer = $('#current-status');
var croppedImageContainer = $('#cropped-image-container');
var croppedImage = $('#cropped-image-container img');

$("body").on("change", ".image", function (e) {
    var files = e.target.files;
    var done = function (url) {
        image.src = url;
        modalContainer.modal('show');
    };

    if (files && files.length > 0) {
        file = files[0];

        if (URL) {
            done(URL.createObjectURL(file));
        } else if (FileReader) {
            reader = new FileReader();
            reader.onload = function (e) {
                done(reader.result);
            };
            reader.readAsDataURL(file);
        }
    }
});

modalContainer.on('shown.bs.modal', function () {
    cropper = new Cropper(image, {
        aspectRatio: 1
    });
}).on('hidden.bs.modal', function () {
    cropper.destroy();
    cropper = null;
});

$("#crop").click(function () {
    canvas = cropper.getCroppedCanvas();

    canvas.toBlob(function (blob) {
        url = URL.createObjectURL(blob);
        var reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = function () {
            var base64data = reader.result;

            $.ajax({
                type: "POST",
                dataType: "json",
                url: "upload.php",
                data: {
                    image: base64data
                },
                success: function (response) {
                    modalContainer.modal('hide');
                    statusContainer.addClass('alert-success').text("Success.");
                    closeAlert(statusContainer, 4000);
                },
                error: function (request, status, error) {
                    modalContainer.modal('hide');
                    statusContainer.addClass('alert-warning').text("Error.");
                    console.log(error);
                    closeAlert(statusContainer, 4000);
                },
                complete: function (response) {
                    croppedImageContainer.show();
                    croppedImage.attr('src', response['responseJSON']['path']);
                }
            });
        }
    });
});

function closeAlert(container, duration = null) {
    $(container).delay(duration).slideUp(200, function () {
        $(this).alert('close');
    });
};