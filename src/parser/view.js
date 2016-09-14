import {ItemView} from 'backbone.marionette';
import template from './template.hbs';
import store from 'store'

export default ItemView.extend({
  template: template,
  className: 'index',

  events: {
    'click .js-save': 'saveDocument'
  },

  saveDocument() {
    let doc = this.$('.js-document').val();
    store.set('currentDocument', doc);

  }
});
