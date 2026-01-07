const RedisEngine = require('../faye-redis');

JS.Test.describe("Redis engine", function() { with(this) {
  before(function() {
    const pw = process.env.TRAVIS ? undefined : "foobared";
    this.engineOpts = {type: RedisEngine, password: pw, namespace: new Date().getTime().toString()};
  });

  after(function(resume) { with(this) {
    disconnect_engine();
    const redis = require('redis').createClient({
      socket: { host: 'localhost', port: 6379 },
      password: engineOpts.password
    });

    redis.connect().then(() => {
      return redis.flushAll();
    }).then(() => {
      return redis.quit();
    }).then(() => {
      resume();
    }).catch(err => {
      console.error('Error in cleanup:', err);
      resume();
    });
  }});

  itShouldBehaveLike("faye engine");

  describe("distribution", function() { with(this) {
    itShouldBehaveLike("distributed engine");
  }});

  if (process.env.TRAVIS) return;

  describe("using a Unix socket", function() { with(this) {
    before(function() { with(this) {
      this.engineOpts.socket = "/tmp/redis.sock";
    }});

    itShouldBehaveLike("faye engine");
  }});
}});
