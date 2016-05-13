import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';

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
    isActive() {
        const status = Session.get('selectedPlayer-' + this._id);
        if(status === undefined)
            Session.set('selectedPlayer-' + this._id, '');

        return status !== '';
    },
});

Template.player.helpers({
    isActive() {
        return this._id === Session.get('selectedPlayer-' + this.leaderboard);
    },
});

Template.body.events({
    'submit #new-leaderboard'(e) {
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
        e.preventDefault();

        // Get value from form element
        const target = e.target;
        const name = target.text.value;

        // Insert a player into a leaderboard
        Players.insert({
            name,
            score: 0,
            leaderboard: this._id, // Leaderboard of the player
        });

        // Clear form
        target.text.value = '';
    },
});

Template.player.events({
    'click li'(e) {
        e.preventDefault();

        if(this._id === Session.get('selectedPlayer-' + this.leaderboard)) {
            // If player is already active
            Session.set('selectedPlayer-' + this.leaderboard, '');
        } else {
            //Set the player as the active one for it's respective leaderboard
            Session.set('selectedPlayer-' + this.leaderboard, this._id);
        }
    },
});
