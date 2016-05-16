import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

import '../../imports/ui/layouts/MainLayout.html';
import '../../imports/ui/layouts/HomeLayout.html';
import '../../imports/ui/layouts/SignUpLayout.html';
import '../../imports/ui/layouts/LogInLayout.html';

FlowRouter.route('/', {
    name: 'home',
    action() {
        BlazeLayout.render('MainLayout', {main: 'HomeLayout'});
        console.log('FLOW ROUTER');
    }
});

FlowRouter.route('/signin', {
    action() {
        BlazeLayout.render('MainLayout', {main: 'SignUpLayout'});
        console.log('SIGN UP');
    }
});

FlowRouter.route('/login', {
    action() {
        BlazeLayout.render('MainLayout', {main: 'LogInLayout'});
        console.log('LOG IN');
    }
});
