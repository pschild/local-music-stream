# local-music-stream

With the combination of the Node server and the Alexa skill you can ask Alexa to play your local mp3 files.

## Plugin Docs
* https://github.com/aceakash/string-similarity

## Dev notes

At the beginning, make sure to create a copy of `.env.template` and name it `.env`. The credentials you define in this file are used for a secure connection between Alexa and your Node server.

Run `npm run build-alexa` to prepare a package that can be uploaded as lambda function. You need to ZIP it manually due to a [bug in gulp-zip](https://github.com/sindresorhus/gulp-zip/issues/64).
