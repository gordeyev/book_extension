import {LayoutView} from 'backbone.marionette';
import template from './template.hbs';
import FragmentView from './fragment-view';
import ImagesView from './images-view';
import store from 'store';
import $ from 'jquery';
import _ from 'lodash';
import salert from 'sweetalert';


export default LayoutView.extend({
  template: template,
  className: 'index',

  ui: {
    editor: '.js-editor',
    fragment: '.js-fragment',
    images: '.js-images-view',
    openImages: '.js-open-images',
    saveModal: '.js-save-modal-wrapper',
    selectNodeForm: '.js-select-form',
    structure: '.js-structure',
    pathInput: '.js-path',
    cancelSaveModal: '.js-cancel-save-modal'
  },

  regions: {
    fragment: '.fragment-region',
    images: '.images-region'
  },

  events: {
    'click .js-btn': 'onBtnClick',
    'keydown @ui.editor': 'onEditorKeyDown',
    'keyup @ui.editor': 'onEditorKeyUp',
    'click @ui.openImages': 'openImages',
    'submit @ui.selectNodeForm': 'setNodeInfoToStore',
    'keyup @ui.pathInput': 'onPathChange',
    'click @ui.cancelSaveModal': 'closeSaveModal'
  },

  onShow() {
    let view = new ImagesView();
    this.images.show(view);

    let text = '';
    let bookTitle = store.get('bookTitle');
    if (store.get('bookId') === store.get('currentBookId')) {
      text = `Структура учебника<br><span style="color: green;">${bookTitle}</span><br><b><span style="color: red;">уже получена</span></b>. Пересчитать структуру?`
    } else {
      text = `Вы хотите получить структуру учебника <br><span style="color: green;">${bookTitle}</span>.<br>Продолжить?`;
    }
    let currentBookId = store.get('currentBookId');
    swal({
      title: "Определение структуры учебника",
      text: text,
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Запустить",
      closeOnConfirm: false,
      html: true
    }, (isConfirm) => {
      if (isConfirm) {
        this.getStructure();
        console.log('get structure');
      }
    });
    console.log('Have a good day!');
    this.ui.editor.html(store.get('currentBookHtml'));
    this.ui.editor.focus();
    $(window).on('keydown', (e) => {
      if ((e.keyCode === 69) && e.metaKey) {
        e.preventDefault();
        this.ui.editor.focus();
      // } else if ((e.keyCode === 68) && e.metaKey) {
      //   e.preventDefault();
      //   this.openImages();
      }
    })
  },

  onBtnClick() {
    console.log('onBtnClick');
  },

  saveEditorContent() {
    let editorHtml = this.ui.editor.html();
    store.set('currentBookHtml', editorHtml);
  },

  setNodeInfoToStore(e) {
    e.preventDefault();
    let root = this.ui.pathInput.val().trim();
    store.set('root', root);
    let nodeId = this.$('.selected-node').first().data('id');
    store.set('nodeId', nodeId);
    this.ui.saveModal.addClass('hidden');
  },

  onEditorKeyDown(e) {
    let isSave = (e.keyCode === 83) && e.metaKey;
    if (isSave) {
      e.preventDefault();
      this.saveEditorContent();
    } else if ((e.keyCode === 72) && e.metaKey) {
      let html = this.getHTMLOfSelection();
      let view = new FragmentView({fragmentHtml: html});
      this.fragment.show(view);
      this.openSaveModal();
    }
  },

  openSaveModal() {
    this.ui.saveModal.removeClass('hidden');
    this.makeTree();
    this.ui.pathInput.focus();
  },

  closeSaveModal(e) {
    if (e) {
      e.preventDefault();
    }
    this.ui.saveModal.addClass('hidden');
    this.fragment.currentView.destroy();
  },

  makeTree() {
    let book = store.get('book');
    let structureHtml = '';
    book.forEach((chapter, chapterIndex) => {
      let chapterHtml = '';
      chapter.list.forEach((section, sectionIndex) => {
        let sectionHtml = '';
        section.list.forEach((media) => {
          let mediaHtml = '';
          media.list.forEach((tile, tileIndex) => {
            mediaHtml += `<div class="pl10 js-node js-tile">
              <span class="js-title" data-id="${tile.id}"  data-title="${chapter.title}"><span style="color: green;">${tileIndex + 1}</span> ${tile.title}</span>
          </div>`;
          });
          sectionHtml += mediaHtml;
        });
        chapterHtml += `
          <div class="pl10 js-node js-section">
            <span class="js-title" data-id="${section.id}"  data-title="${chapter.title}"><span style="color: green;">${sectionIndex + 1}</span> ${section.title}</span>
            <div class="pl10">${sectionHtml}</div>
          </div>
        `;
      });
      structureHtml += `
        <div class="js-chapter js-node">
          <span class="js-title" data-id="${chapter.id}" data-title="${chapter.title}"><span style="color: green;">${chapterIndex + 1}</span> ${chapter.title}</span>
          <div class="pl10">${chapterHtml}</div>
        </div>
      `;
    });

    this.ui.structure.html(structureHtml);
  },


  onPathChange(e) {
    let str = this.$(e.currentTarget).val().trim();
    let root = [];
    if (str != '') {
      root = str.split(/\s+/g).map(function (x) {
        return parseInt(x) - 1;
      });
    }
    let imageParentNodeId = 0;
    let imageNodeId = 0;
    this.ui.structure.find('.selected-node').removeClass('selected-node');
    this.ui.structure.find('.js-node').removeClass('hidden');
    if (root.length === 1) {
      imageParentNodeId = store.get('bookId');
      this.ui.structure.children('.js-chapter').each((index, chapter) => {
        if (root[0] == index) {
          imageNodeId = this.$(chapter).children('.js-title').first().data('id');
          this.$(chapter).children('.js-title').first().addClass('selected-node');
        } else {
          this.$(chapter).addClass('hidden');
        }
      });
    } else if (root.length === 2) {
      this.ui.structure.children('.js-chapter').each((index, chapter) => {
        if (root[0] == index) {
          imageParentNodeId = this.$(chapter).children('.js-title').first().data('id');
          this.$(chapter).find('.js-section').each((index, section) => {
            if (root[1] == index) {
              imageNodeId = this.$(section).children('.js-title').first().data('id');
              this.$(section).children('.js-title').first().addClass('selected-node');
            } else {
              this.$(section).addClass('hidden');
            }
          });
        } else {
          this.$(chapter).addClass('hidden');
        }
      });
    } else if (root.length === 3) {
      this.ui.structure.children('.js-chapter').each((index, chapter) => {
        if (root[0] == index) {
          imageParentNodeId = this.$(chapter).children('.js-title').first().data('id');
          this.$(chapter).find('.js-section').each((index, section) => {
            if (root[1] == index) {
              imageNodeId = this.$(section).children('.js-title').first().data('id');
              this.$(section).find('.js-tile').each((index, tile) => {
                if (root[2] == index) {
                  this.$(tile).children('.js-title').first().addClass('selected-node');
                }
              });
            } else {
              this.$(section).addClass('hidden');
            }
          });
        } else {
          this.$(chapter).addClass('hidden');
        }
      });
    }
    store.set('imageParentNodeId', imageParentNodeId);
    store.set('imageNodeId', imageNodeId);
  },


  onEditorKeyUp(e) {
  },

  getHTMLOfSelection() {
    var range;
    if (document.selection && document.selection.createRange) {
      range = document.selection.createRange();
      return range.htmlText;
    }
    else if (window.getSelection) {
      var selection = window.getSelection();
      if (selection.rangeCount > 0) {
        range = selection.getRangeAt(0);
        var clonedSelection = range.cloneContents();
        var div = document.createElement('div');
        div.appendChild(clonedSelection);
        return div.innerHTML;
      }
      else {
        return '';
      }
    }
    else {
      return '';
    }
  },

  getSections(nodeId) {
    return new Promise((resolve, reject) => {
      let url = `http://some-url`;
      let data = `mod=projects&obj=ntype&met=treeview&atr=children.${nodeId}.books.ebook`;
      $.ajax({
        url: url,
        method: 'POST',
        data: data,
        contentType: 'application/octet-stream',
        success: (res) => {
          let data = JSON.parse(res);
          let re = /\[\{(.+)\}\]/g;
          let sections = {
            id: nodeId
          };
          if (data.js.match(re)) {
            sections['list'] = JSON.parse(data.js.match(re)[0]);
          } else {
            sections['list'] = [];
          }
          resolve(sections);
        }
      });
    });
  },

  getStructure() {
    var bookId = store.get('bookId');
    let currentBookId = store.get('bookId');
    let book = [];
    this.getSections(bookId).then((data) => {
      Promise.all(
        data.list.map((item) => {
          let chapter = {
            id: item.NodId,
            title: item.NName,
            list: []
          };
          book.push(chapter);
          return this.getSections(item.NodId).then(function (data) {
            return data;
          });
        })
      ).then(() => {
        Promise.all(_.map(book, (chapter) => {
          return new Promise((resolve) => {
            this.getSections(chapter.id).then((item) => {
              Promise.all(item.list.map((section) => {
                chapter.list.push({
                  id: section.NodId,
                  title: section.NName,
                  list: []
                });
              }))
            }).then(function (data) {
              resolve(data);
            });
          });
        })).then((data) => {
          Promise.all(book.map((chapter) => {
            return new Promise((resolveOne) => {
              Promise.all(chapter.list.map((section) => {
                return new Promise((resolveTwo) => {
                  this.getSections(section.id).then((media) => {
                    media.list.map(function (data) {
                      section.list.push({
                        id: data.NodId,
                        title: data.NName,
                        list: []
                      });
                    });
                  }).then(function (data) {
                    resolveTwo(data);
                  })
                });
              })).then((data) => {
                resolveOne(data);
              });
            });
          })).then(() => {
            Promise.all(book.map((chapter) => {
              return new Promise((resolveOne) => {
                Promise.all(chapter.list.map((section) => {
                  return new Promise((resolveTwo) => {
                    Promise.all(section.list.map((media) => {
                      return new Promise((resolveThree) => {
                        this.getSections(media.id).then((tile) => {
                          tile.list.forEach(function (item) {
                            media.list.push({
                              id: item.NodId,
                              title: item.NName,
                            });
                          });
                        }).then((data) => {
                          resolveThree(data);
                        })
                      })
                    })).then((data) => {
                      resolveTwo(data);
                    });
                  });
                })).then((data) => {
                  resolveOne(data);
                });
              });
            })).then(() => {
              salert('Структура учебника определена');
              store.set('book', book);
              store.set('currentBookId', currentBookId);
            });
          });
        });
      });
    });
  },

  openImages() {
    this.ui.images.removeClass('hidden');
  }
});
