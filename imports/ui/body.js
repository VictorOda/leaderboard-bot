import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { Leaderboards } from '../api/leaderboards.js';
import { Players } from '../api/players.js';

import './body.html';

Template.body.helpers({
    leaderboards() {
        return Leaderboards.find({});
    },
});

Template.leaderboard.helpers({
    players() {
        return Players.find({leaderboard: this._id});
    },
});

Template.player.helpers({
    isActive() {
        return this.status === "active";
    },
});

Template.body.events({
    'submit #new-leaderboard'(e) {
        // Prevent default browser form submit
        e.preventDefault();

        // Get value from form element
        const target = e.target;
        const title = target.text.value;

        // Insert a leaderboard into the collection
        Leaderboards.insert({
            title,
            createdAt: new Date(), // current time
        });

        // Clear form
        target.text.value = '';
    },
});

Template.leaderboard.events({
    'submit #new-player'(e) {
        // Prevent default browser form submit
        e.preventDefault();

        // Get value from form element
        const target = e.target;
        const name = target.text.value;

        // Insert a player into a leaderboard
        Players.insert({
            name,
            score: 0,
            leaderboard: this._id, // Leaderboard of the player
            status: "", // Status of the player
        });

        // Clear form
        target.text.value = '';
    },
});

Template.player.events({
    'click li'(e) {
        // Prevent default browser form submit
        e.preventDefault();
        // Reset all the players of the leaderboard
        Meteor.call('resetActivePlayers', this.leaderboard);
        console.log(Players.find({leaderboard: this.leaderboard}).fetch());
        // Set this one as active
        Players.update(this._id, {$set:{
            status: "active"
        }});
    },
});
