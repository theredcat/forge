var dhcpd = require('./dhcpd');
var static = require('node-static');
var tftpd = require('tftp');
var http = require('http');
var nconf = require('nconf');
var router = require('./routes');
var url = require('url');
function Forge (opts) {
  var self = this;
  if(!opts)
    opts = {};
  
  if(!opts.tftp)
    opts.tftp = {};
  self.initialize_tftpd(conf.get(opts.tftp));
  
  if(!opts.http)
    opts.http = {};
  self.initialize_httpd(conf.get(opts.http));
  
  if(!opts.tftp)
    opts.dhcp = {};
  
  opts.dhcp.store = opts.store;
  self.initialize_dhcpd(opts.dhcp);
}

Forge.prototype.initialize_tftpd = function (opts) {
  this.tftpd = tftpd.createServer({
    host: opts.host || '0.0.0.0',
    port: opts.port || 69,
    root: opts.root || './static/',
    denyPUT: true
  }).listen();
};

Forge.prototype.initialize_dhcpd = function (opts) {
  var self = this;

  if(!opts.store)
    var store = require('./memory-store');
  
  self.dhcpd = new dhcpd({
    subnet: opts.subnet || '192.0.2.0/24',
    range_start: opts.range_start || '192.0.2.100',
    range_end: opts.range_end || '192.0.2.200',
    routers: opts.routers || [],
    nameservers: opts.nameservers || [],
    host: opts.host || '192.0.2.1',
    store: opts.store
  });
};

Forge.prototype.initialize_httpd = function initialize_httpd (opts) {
  var self = this;

  self.staticServer = new(static.Server)(opts.root);

  self.httpd = http.createServer(function (req, res) {
    var path = url.parse(req.url).pathname;
    if(path.substr(0,7) == '/files/'){
      file.serve(req, res);
    }else{
      var match = router.match(path);
      match.fn(req, res, match);
    }
  }).listen(opts.port || 80, opts.host || '0.0.0.0');
}

module.exports = Forge;
