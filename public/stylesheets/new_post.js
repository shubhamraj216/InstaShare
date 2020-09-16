var _PREVIEW_URL;

document.querySelector("#upload-dialog").addEventListener('click', function() {
  document.querySelector("#image-file").click();
});

document.querySelector("#remove-image").addEventListener('click', function() {
  document.querySelector("#preview-image").style.display = 'none';
  document.querySelector("#remove-image").style.display = 'none';
  document.querySelector("#upload-dialog").style.display = 'inline-block';
});

document.querySelector("#image-file").addEventListener('change', function() {
  var file = this.files[0];

  var mime_types = [ 'image/jpeg', 'image/png' ];

  if(mime_types.indexOf(file.type) == -1) {
    alert('Error : Incorrect file type');
    return;
  }

  // if(file.size > 2*1024*1024) {
  //     alert('Error : Exceeded size 2MB');
  //     return;
  // }

  // validation is successful

  document.querySelector("#upload-dialog").style.display = 'none';

  _PREVIEW_URL = URL.createObjectURL(file);

  document.querySelector("#preview-image").setAttribute('src', _PREVIEW_URL);
  document.querySelector("#preview-image").style.display = 'block';

  document.querySelector("#remove-image").style.display = 'block';
});