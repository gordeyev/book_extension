console.log('book creator!!');
import './plugins';
import Backbone from 'backbone';
import $ from 'jquery';

import Application from './application/application';
import HeaderService from './header/service';
import IndexRouter from './index/router';
import EditorRouter from './editor/router';
// import ParserRouter from './parser/router';
import HelpRouter from './help/router';
// import ChapterRouter from './chapter/router';

let className = 'book-creator-wrapper';
let onShowBodyClassName = 'on-show-wrapper';


function startApp() {
    let app = new Application();

    HeaderService.setup({
        container: app.layout.header
    });

    app.index = new IndexRouter({
        container: app.layout.content
    });

    app.index = new EditorRouter({
        container: app.layout.content
    });

    // app.index = new ParserRouter({
    //   container: app.layout.content
    // });

    app.index = new HelpRouter({
        container: app.layout.content
    });

    // app.index = new ChapterRouter({
    //   container: app.layout.content
    // });

    Backbone.history.start();
}


function singleWrapper(className) {
    let number = $(`.${className}`).length;
    if (number === 0) {
        $('body').append(`<div class="${className} application" style="overflow: scroll;"></div>`);
        $('body').addClass(onShowBodyClassName);
        startApp();
    } else {
        $('body').toggleClass(onShowBodyClassName);
    }
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.message === 'icon:clicked') {
            singleWrapper(className);
        }
    });
