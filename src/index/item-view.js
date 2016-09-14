import {ItemView} from 'backbone.marionette';
import template from './item.hbs';
import store from 'store';
import salert from 'sweetalert';

export default ItemView.extend({
  tagName: 'div',
  template: template,
  className: 'be-book-item',
  events: {
    'click .js-id-link': 'onClickOnId'
  },

  onClickOnId(e) {
    e.preventDefault();
    let el = this.$(e.currentTarget);
    let id = el.data('id');
    let title = el.data('title');
    store.set('bookId', id);
    store.set('bookTitle', title);
    salert(`Вы выбрали учебник ${title}`);
  }
});
