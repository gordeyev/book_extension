import {LayoutView} from 'backbone.marionette';
import CompositeView from './composite-view';
import template from './template.hbs';
import $ from 'jquery';
import {Collection} from 'backbone';
import {Model} from 'backbone';

export default LayoutView.extend({
  template: template,

  className: 'index',

  regions: {
    booksSearch: '.be-books'
  },

  events: {
    'click .js-btn': 'onBtnClick'
  },

  onShow() {
    this.getBookList();
  },

  onBtnClick() {
    console.log('onBtnClick');
  },

  getBookList() {
    let data = {mod: 'projects', obj: 'ntype', met: 'treeview', atr: 'children.1.books.ebook'};
    let url = `http://some-url`;
    $.ajax({
      url: url,
      method: 'POST',
      data: data,
      contentType: 'application/octet-stream',
      success: (res) => {
        let js = JSON.parse(res).js;
        let regexp = /(\[.+\])/gi;
        let books = JSON.parse(js.match(regexp)[0]);
        let collection = new Collection;
        let model = new Model;
        collection.set(books);
        let view = new CompositeView({
          model: model,
          collection: collection
        });
        this.booksSearch.show(view);
      }
    });
  }
});
