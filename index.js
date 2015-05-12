#!/usr/bin/env node

var forge = require('./lib/forge');
var mem_store = require('./lib/memory-store');

var store = new mem_store('192.168.119.30', '192.168.119.60');

var server = new forge({
  dhcp : {
    subnet: '192.168.119.0/24',
    range_start: '192.168.119.30',
    range_end: '192.168.119.60',
    routers: [ '192.168.119.1' ],
    nameservers: [ '8.8.8.8', '8.8.4.4' ],
    host: '192.168.119.1'
  },
  
});

