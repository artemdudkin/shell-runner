const fn = "../data/data.json";
const alias = {
  "a"      : "../data/a",
  "ls"     : "ls -l ../data/",
  "deploy" : "../data/deploy gtd",
}

const lowdb = require("lowdb");

module.exports = function(data) {
  if (!data.command || typeof data.command != 'string') {
    return {resultCode:-1, resultDescription:"NO_COMMAND"};
  }
  if (!alias[data.command]) {
    return {resultCode:-2, resultDescription:"UNKNOWN_COMMAND"};
  }
  const cmd_args = alias[data.command].split(" ");
  const cmd = cmd_args[0];
  cmd_args.shift();

  const db = lowdb(fn);
  db.set(cmd, [{
    d:new Date(),
    t:'start'
  }]).write();

  var util = require('util');
  var spawn = require('child_process').spawn;
  var proc = spawn(cmd, cmd_args);

  proc.stdout.on('data', function (data) {
    const db = lowdb(fn);
    db.get(cmd).push({
      d:new Date(),
      t:'stdout',
      data:data.toString('utf8')
    }).write();
  });

  proc.stderr.on('data', function (data) {
    const db = lowdb(fn);
    db.get(cmd).push({
      d:new Date(),
      t:'stderr',
      data:data.toString('utf8')
    }).write();
  });

  proc.on('exit', function (code) {
    const db = lowdb(fn);
    db.get(cmd).push({
      d:new Date(),
      t:'end',
      data:code
    }).write();
  });

  proc.on('error', function (data) {
    const db = lowdb(fn);
    db.get(cmd).push({
      d:new Date(),
      t:'error',
      data:data.toString('utf8')
    }).write();
  });

  return {resultCode:0}
}
