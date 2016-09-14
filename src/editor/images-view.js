import {ItemView} from 'backbone.marionette';
import template from './images.hbs';
import $ from 'jquery';
import _ from 'lodash';
import store from 'store';


export default ItemView.extend({
  template: template,

  ui: {
    inputFile: '.input-file',
    images: '.js-image-wrapper',
    close: '.js-close-images',
  },

  events: {
    'change @ui.inputFile': 'onChangeInputFile',
    'click @ui.close': 'close'
  },

  onShow() {
    this.$el.on('click', '.js-image-wrapper img', (e) => {
      if (this.$(e.currentTarget).hasClass('not-server')) {
        this.sendImage(e);
      } else {
        console.log('already uploaded');
        store.set('currentImage', this.$(e.currentTarget)[0].outerHTML);
        this.close();
      }
    });
  },

  onChangeInputFile() {
    let input = this.ui.inputFile[0];
    let $images = this.ui.images;
    $images.html('');
    let images = [];
    if (input.files && input.files[0]) {
      Promise.all(_.map(input.files, function(file, index) {
        return new Promise(function (resolve) {
          var reader = new FileReader();
          reader.onload = function (e) {
            images.push({
              fileName: file.name,
              index: index,
              src: e.target.result
            });
            resolve();
          };
          reader.readAsDataURL(file);
        });
      })).then(function () {
        let sortedImages = _.sortBy(images, function (item) {
          let result = item.fileName.split('_');
          if (parseInt(result[1])) {
            result = parseInt(result[0])*1000 + parseInt(result[1]);
          } else {
            result = parseInt(result[0])*1000 + 1;
          }
          return result;
        });
        _.each(sortedImages, function (image) {
          $images.append(`<img class="not-server" style="max-width: 400px;" src="${image.src}" data-index="${image.index}" /><div class="image-separator">${image.fileName}</div><br>`)
        });
      });
    }
  },

  sendImage(e) {
    console.log('send image');
    let index = this.$(e.currentTarget).data('index');
    let imageNodeId = store.get('imageNodeId');
    let imageParentNodeId = store.get('imageParentNodeId');
    let url = `http://some-url`;
    let file = this.ui.inputFile[0].files[index];
    let formData = new FormData();
    formData.set('upload', file);
    formData.set('ckCsrfToken', 'pp7Nv7DiUvMMqrWGD4TpsT767bg9VzC38reccPk7');
    $.ajax({
      url: url,
      type: 'POST',
      data: formData,
      cache: false,
      contentType: false,
      processData: false,
    }).then((data) => {
      let regex = /\"(http.+)",/g;
      let imgUrl = regex.exec(data)[1];
      this.$(e.currentTarget).attr('src', imgUrl).removeAttr('class').removeAttr('data-index');
      store.set('currentImage', this.$(e.currentTarget)[0].outerHTML);
      this.close();
    });
  },

  close() {
    this.$el.closest('.js-images-view').addClass('hidden');
  }
});
