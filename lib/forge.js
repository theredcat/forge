var dhcpd = require('./dhcpd');
var tftpd = require('tftp');
var http = require('http');
var router = require('./routes');
var url = require('url');
function Forge (opts) {
  var self = this;
  if(!opts)
    opts = {};
  
  if(!opts.tftp)
    opts.tftp = {};
  self.initialize_tftpd(opts.tftp);
  
  if(!opts.http)
    opts.http = {};
  self.initialize_httpd(opts.http);
  
  if(!opts.tftp)
    opts.dhcp = {};
  self.initialize_dhcpd(opts.dhcp);
}

Forge.prototype.initialize_tftpd = function initialize_tftpd (opts) {
  var self = this;
  self.tftpd = tftpd.createServer({
    host: opts.host || '0.0.0.0',
    port: opts.port || 69,
    root: opts.root || './static/',
    denyPUT: true
  }).listen();
};

Forge.prototype.initialize_dhcpd = function initialize_dhcpd (opts) {
  var self = this;

  if(!opts.store)
    var mem_store = require('./memory-store');

  var range_start = opts.range_start || '192.0.2.100';
  var range_end = opts.range_end || '192.0.2.200';
  var store = opts.store || new mem_store(range_start, range_end);
  
  self.dhcpd = new dhcpd({
    subnet: opts.subnet || '192.0.2.0/24',
    range_start: opts.range_start || range_start,
    range_end: opts.range_end || range_end,
    routers: opts.routers || [],
    nameservers: opts.nameservers || [],
    host: opts.host,
    save_lease: function(lease, cb){
      store.save_lease(lease, cb);
    },
    get_lease: function(mac_addr, cb){
      store.get_lease(mac_addr, cb);
    },
    get_lease_by_ip: function(ip, cb){
      store.get_lease_by_ip(ip, cb);
    },
    get_next_ip: function(cb){
      store.get_next_ip(cb);
    },
    remove_lease: function(mac_addr, cb){
      store.remove_lease(mac_addr, cb);
    }
  });
};

Forge.prototype.initialize_httpd = function initialize_httpd (opts) {
  var self = this;
  self.httpd = http.createServer(function (req, res) {
    console.log("#####>>> GOT HTTP REQUEST");
    var path = url.parse(req.url).pathname;
    var match = router.match(path);
    match.fn(req, res, match);
  }).listen(opts.port || 80, opts.host || '0.0.0.0');
}

module.exports = Forge;
