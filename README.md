# boing
The minecraft pinger which utilizes bots.

## Install

`npm install boing`

### boing(ip, [options], callback)

```js
var boing = require('boing');

boing('us.mineplex.com', {
  username: 'boing'
  password: '****'
}, function(err,response) {
  if (err) throw err;
  console.log(response);
});
```
