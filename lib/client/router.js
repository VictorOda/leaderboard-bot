import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

import '../../imports/ui/layouts/MainLayout.html';
import '../../imports/ui/layouts/HomeLayout.html';

FlowRouter.route('/', {
    name: 'home',
    action() {
        BlazeLayout.render('MainLayout', {main: 'HomeLayout'});
        console.log('FLOW ROUTER');
    }
});

// FlowRouter.route('/signin', {
//     action: function(params, queryParams) {
//         console.log("Yeah! We are on the post:", params.postId);
//     }
// });
