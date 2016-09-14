import {ItemView} from 'backbone.marionette';
import template from './fragment.hbs';
import $ from 'jquery';
import store from 'store';
import beautify from 'js-beautify/js/lib/beautify-html';
import swal from 'sweetalert';

export default ItemView.extend({
  className: 'html-fragment',
  template: template,

  ui: {
    'sourceModal': '.js-code-modal',
    'source': '.js-code',
    'hideSource': '.js-hide-source',
    'applySource': '.js-apply-source'
  },

  events: {
    'click @ui.applySource': 'applySource',
    'click @ui.hideSource': 'hideSource'
  },

  onShow() {
    tinymce.init({
      selector: '#myTextarea',
      theme: 'modern',
      skin: false,
      menubar: false,
      toolbar: 'undo redo | formath1 | source | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | img currentimg | save | close',
      plugins: "paste",
      setup: (editor) => {
        editor.addButton('formath1', {
          title : 'Make H1',
          text: 'Title',
          icon : false,
          onclick : () => {
            this.formatTitle();
          }
        });
        editor.addButton('img', {
          text: 'Images',
          icon: false,
          onclick: () => {
            this.showImages();
          }
        });

        editor.addButton('currentimg', {
          text: 'Current Image',
          icon: false,
          onclick: () => {
            let currentImage = store.get('currentImage');
            editor.execCommand('mceInsertContent', false, currentImage);
          }
        });
        editor.addButton('save', {
          text: 'Save',
          icon: false,
          onclick: () => {
            this.save();
          }
        });
        editor.addButton('close', {
          text: 'Close',
          icon: false,
          onclick: () => {
            this.close()
          }
        });
        editor.addButton('source', {
          text: 'Source',
          icon: false,
          onclick: () => {
            this.showSource()
          }
        });
      },
    });
    tinymce.activeEditor.plugins.paste.clipboard.pasteHtml(this.options.fragmentHtml);
  },

  showImages() {
    $('.js-images-view').removeClass('hidden');
  },

  formatTitle() {
    tinymce.activeEditor.execCommand('FormatBlock', false, 'h1');
  },

  showSource() {
    this.ui.sourceModal.removeClass('hidden');
    let source = beautify.html_beautify(tinymce.activeEditor.getContent());
    this.ui.source.text(source);
  },

  hideSource() {
    this.ui.sourceModal.addClass('hidden');
  },

  applySource() {
    let content = this.ui.source.text();
    tinymce.activeEditor.setContent(content);
  },

  saveNode(nodeId, title, text) {
    return new Promise((resolve) => {
      let data = `NFlag=1&NName=${title}&Owner=75&Gwner=11&Mfier=89&NPerm=4092&sectionNumber=&useParagraph=0&text=${text}&processTypograph=1&mbCodeArrInText=&active=1&pdfPage=1&inDigital=1&inPaper=1&tile=0&additional=0&additional_fixed=0&demoMode=0&prj=ebook&mod=books&NodId=${nodeId}`;
      let url = `http://some-url`;
      $.ajax({
        url: url,
        method: 'POST',
        data: data,
        contentType: 'application/octet-stream',
        success: (res) => {
          resolve(res);
        }
      });
    });
  },

  close() {
    this.destroy();
  },

  save() {
    this.tryToSave();
  },

  tryToSave() {
    let root = store.get('root').split(/\s+/g).map(function (x) {
      return parseInt(x) - 1;
    });
    let nodeId = store.get('nodeId');
    let content = tinymce.activeEditor.getContent();
    this.$el.append(`<div id="blockForContent" style="display: none;">${content}</div>`);
    let $title = this.$('#blockForContent h1');
    if ($title.length) {
      let title = $title.text();
      this.$('#blockForContent h1').remove();
      let text = escape(this.$('#blockForContent').html());
      this.$('#blockForContent').remove();
      this.saveNode(nodeId, title, text).then((data) => {
        let book = store.get('book');
        if (root.length === 1) {
          book[root[0]].title = title;
        } else if (root.length === 2) {
          book[root[0]].list[root[1]].title = title;
        } else if (root.length === 3) {
          book[root[0]].list[root[1]].list[0].list[root[2]].title = title;
        }
        store.set('book', book);
        this.destroy();
      });
    } else {
      swal("Не указан заголовок.");
    }
  },

  getNode(root) {
    let book = store.get('book');
    let node = book[root[0]];
    if (root.length > 1) {
      node = node.list[root[1]];
    }
    if (root.length > 2) {
      node = node.list[0].list[root[2]];
    }
    return node;
  },

  onBeforeDestroy() {
    tinymce.activeEditor.remove();
  }
});
