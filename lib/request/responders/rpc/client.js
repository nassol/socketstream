var cbStack, defaultCallback, numRequests, ss;

ss = require('socketstream');

numRequests = 0;

cbStack = {};

defaultCallback = function(x) {
  return console.log(x);
};

ss.registerApi('rpc', function() {
  var args, cb, lastArg, msg, obj;
  args = Array.prototype.slice.call(arguments);
  obj = {};
  obj.m = args[0];
  obj.id = ++numRequests;
  lastArg = args[args.length - 1];
  if (typeof lastArg === 'function') {
    obj.p = args.slice(1, args.length - 1);
    cb = lastArg;
  } else {
    obj.p = args.slice(1);
    cb = defaultCallback;
  }
  cbStack[obj.id] = cb;
  msg = JSON.stringify(obj);
  ss.send('rpc|' + msg);
  return;
});

ss.message.on('rpc', function(msg) {
  var cb, obj;
  obj = JSON.parse(msg);
  if (obj.id && (cb = cbStack[obj.id])) {
    if (obj.e) {
      console.error('SocketStream RPC server error:', obj.e.message);
    } else {
      cb.apply(cb, obj.p);
    }
    return delete cbStack[obj.id];
  }
});
