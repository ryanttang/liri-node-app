// Pull Keys from Keys.js
var apikeys = require('./keys.js');
var request = require('request');
var twitter = require('twitter');
var spotify = require('node-spotify-api');
var inquirer = require('inquirer');
var fs = require('fs');
var dotenv = require("dotenv").config();

// Start Program
startProgram();

function startProgram() {
    logResults('to start the program', 'node liri.js');

    inquirer.prompt([{
        type: 'list',
        name: 'program',
        message: 'What program would you like to run?',
        choices: [
            'my-tweets',
            'spotify-this-song',
            'movie-this',
            'do-what-it-says'
        ]
    }
])
.then((answers) => {

    switch(answers.program) {
       
        case 'my-tweets': 
        getTweets();
        break;

        case 'spotify-this-song':
        inquirer.prompt([{
            type: 'input',
            name: 'song',
            message: 'What song would you like info for?',
        }
        ])
        .then((answers) => {
             var song = answers.song;
             getMusic(song);
        });
        break;

        case 'movie-this':
        inquirer.prompt([{
            type: 'input',
            name: 'movie',
            message: 'What movie would you like info for?',
        }
        ])
        .then((answers) => {
            var movie = answers.movie;
             getMovie(movie);
        });
        break;

        case 'do-what-it-says':
            console.log('\nThis function is not supported.\n');
            logResults('do-what-it-says ', 'not supported');
            restartProgram();
            break;

        default:
            logResults('startProgram() ', 'default Switch/Case');
            console.log("Something is wrong. Try Again.")
        }
    })
}

function restartProgram() {
    inquirer.prompt([{
        type: 'confirm',
        name: 'confirm',
        message: 'Restart Program?',
        }
    ])
    .then((answers) => {
        if (answers.confirm) {
            logResults('to restart the program', 'yes');
            startProgram();
        } else {
            logResults('to abort the program', 'no');
            console.log("Bye!");
        }
    })
}

function getTweets() {
    var client = new twitter(apikeys.twitter);
    var screenName = {screen_name: 'dougiesmokesays'};
    client.get('statuses/user_timeline', screenName, function(error, tweets, response) {

        if (error) {
            logErrors('getTweets()', '@dougiesmokesays');
            console.log(error);
        }

        console.log("\n@dougiesmokesays latest tweets: \n");

        for (var i = 0; i < tweets.length; i++) {
            var date = tweets[i].created_at;
            console.log(date.substring(0,19) + " - " + tweets[i].text)
        }
        console.log('');
        });
        logResults('my-tweets ', '@dougiesmokesays');
        setTimeout(restartProgram, 1000);
    }

function getMusic(song) {
    var Spotify = new spotify(apikeys.spotify);

    Spotify.search({ type: 'track', query: song, limit: 1 }, (err, data) => {
        if (err) {
            logErrors('getMusic()', song);
            return console.log(`\n${err}\n`);
        }
        var artistName = data.tracks.items[0].album.artists[0].name;
        var songName = data.tracks.items[0].name;
        var songURL = data.tracks.items[0].album.artists[0].external_urls.spotify;
        var albumName = data.tracks.items[0].album.name;

        console.log("\nCool!\n");
        console.log(`Now Playing: '${songName}' by ${artistName} from '${albumName}'`);
        console.log(`from: ${songURL}`);

        logResults('spotify-this-song ', song);
        setTimeout(restartProgram, 1000);
    });
}

function getMovie(movie) {
    var apiKey = "trilogy";
    var movieQueryUrl = `http://www.omdbapi.com/?t=${movie}&apikey=${apiKey}`;
    var movie = process.argv[3];

         if(!movie) {
        movie = "mr nobody";
        }
    request(movieQueryUrl, (error, response, body) => {

        if (JSON.parse(body).Response === 'False') {
            console.log("\nMovie title does not exist.\n");
            logErrors('getMovie()', movie);
            restartProgram();

        } else if (!error && response.statusCode === 200) {
            var title = JSON.parse(body).Title;
            var movieYear = JSON.parse(body).Year;
            var country = JSON.parse(body).Country;
            var plot = JSON.parse(body).Plot;
            var actors = JSON.parse(body).Actors;
            var IMDB_Rating;
            var rotten_Rating;

            if (JSON.parse(body).Ratings[0]) {
                IMDB_Rating = JSON.parse(body).Ratings[0].Value;
            } else {
                IMDB_Rating = 'undefined';
            }
            
            if (JSON.parse(body).Ratings[1]) {
                rotten_Rating = JSON.parse(body).Ratings[1].Value;
            } else {
                rotten_Rating = 'undefined';
            }

            console.log("\nCool!\n");
            console.log(`Showing '${title}', Starring ${actors}. Released ${country} in ${movieYear}. IMDB: ${IMDB_Rating} RT: ${rotten_Rating}\n`);
            console.log(`Plot: '${plot}\n`);

            logResults('movie-this ', movie);
            setTimeout(restartProgram, 1000);

            } else {
            logErrors('getMovie()', movie);
            return console.log(error);
        }
    });
}

function logResults(func, query) {
    var resultD = new Date();
    fs.appendFile("log.txt", `\n $(resultD.getTime()}: User Requested: ${func} with a query of ${query}',`, (err) => {

        if (err) {
            logErrors('logResults()', query);
            return console.log(err);
        }
    });
}

function logErrors(func, query) {
    var errorD = new Date();
    fs.appendFile("log.txt", `\n ${errorD.getTime()}: Error Occured Running: ${func} with a query of ${query}', `, (err) => {

        if (err) {
            logErrors('logErrors()', query);
            return console.log(err);
        }
    });
}