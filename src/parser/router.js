import {Router} from 'backbone-routing';
import HeaderService from '../header/service';
import IndexRoute from './route';

export default Router.extend({
  initialize(options = {}) {
    this.container = options.container;
    this.listenTo(this, 'before:enter', this.onBeforeEnter);

    // HeaderService.request('add', {
    //   name: 'Parser',
    //   path: 'parser',
    //   type: 'primary'
    // });
  },

  onBeforeEnter() {
    console.log('onBeforeEnter parser');
    // HeaderService.request('activate', {
    //   path: 'parser'
    // });
  },

  routes: {
    'parser': 'index'
  },

  index() {
    return new IndexRoute({
      container: this.container
    });
  }
});
