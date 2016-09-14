import {Router} from 'backbone-routing';
import HeaderService from '../header/service';
import IndexRoute from './route';

export default Router.extend({
  initialize(options = {}) {
    this.container = options.container;
    this.listenTo(this, 'before:enter', this.onBeforeEnter);

    HeaderService.request('add', {
      name: 'Help',
      path: 'help',
      type: 'primary'
    });
  },

  onBeforeEnter() {
    HeaderService.request('activate', {
      path: 'help'
    });
  },

  routes: {
    'help': 'index'
  },

  index() {
    return new IndexRoute({
      container: this.container
    });
  }
});
