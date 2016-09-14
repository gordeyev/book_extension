import {CompositeView} from 'backbone.marionette';
import {Collection} from 'backbone';
import ItemView from './item-view';
import template from './composite.hbs';

export default CompositeView.extend({
  template: template,
  className: 'be-books',
  childViewContainer: ".be-books-list",
  keyJustPressed: false,
  childView: ItemView,
  ui: {
    searchField: '.js-search'
  },
  events: {
    'keyup @ui.searchField': 'onSearch'
  },

  initialize() {
    this.fullCollection = new Collection(this.collection.models);
  },

  onShow() {
    this.$('.js-search').focus();
  },

  onSearch(e) {
    this.q = this.$(e.currentTarget).val();

    let search = () =>  {
      console.log('search');
      if (this.q) {
        this.collection.reset(this.fullCollection.filter((model) => {
          return model.get('NName').toLowerCase().search(this.q.toLowerCase()) >= 1
        }));
      } else {
        this.collection.reset(this.fullCollection.models);
      }
      this.keyJustPressed = false;
    };

    if (!this.keyJustPressed) {
      this.keyJustPressed = true;
      this.searchAfterDelay = setTimeout(search, 1500);
    }
  }
});
