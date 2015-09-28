var mc = require('minecraft-protocol');
var mineflayer = require('mineflayer');
var request = require('request');

module.exports = function(options,callback) {

  if (!options.ip || !options.username || !options.password) {
    callback('You must specify the username, password, and ip in the options.');
    return;
  }

  var port = options.ip.indexOf(':') !== -1 ? options.ip.split(':')[1] : 25565;
  var ip = options.ip.indexOf(':') !== -1 ? options.ip.split(':')[0] : options.ip;

  mc.ping({
    host: ip,
    port: port
  }, function(err, response) {
    if (err) {
      callback(err);
      return;
    }
    var data = response;
    data.whitelist = undefined;
    if (response.version.protocol === 4 && response.players.online !== 0 || response.players.online > 12) {
      var bot = mineflayer.createBot({
        host: ip,
        port: port,
        username: options.username,
        password: options.password
      });

      bot.on('spawn', function() {
        var whitelist = false;
        data.whitelist = false;
        var players = [];
        for (var i in bot.players) {
          if (i === options.username) continue;
          players.push({
            "name": bot.players[i].username
          });
        }
        bot.end();

        function addid(i) {
          request('https://api.mojang.com/users/profiles/minecraft/' + players[i].name, function(error, response, body) {
            if (error) {
              callback(error);
              return;
            }
            if (response.statusCode === 200) {
              var uuid = JSON.parse(body).id;
              uuid = uuid.substr(0, 8) + '-' + uuid.substr(8,4) + '-' + uuid.substr(12,4) + '-' + uuid.substr(16,4) + '-' + uuid.substr(20,12);
              players[i].id = uuid;
            }
            if (i + 1 === players.length) {
              data.players.sample = players;
              callback(null,data);
            }
          });
        }
        for (i = 0; i < players.length; i++) {
          addid(i);
        }
      });

      bot.on('end', function() {
        if (typeof whitelist !== 'undefined' && whitelist !== false) {
          data.whitelist = true;
          callback(null,data);
        }
      });
    } else {
      callback(null,data);
    }
  });
};
