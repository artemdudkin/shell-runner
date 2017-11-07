const fn = "../data/data.json";
const alias = {
  "a"      : "../data/a",
  "ls"     : "ls -l ../data/"
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
  const value = db.get(cmd).value();
  return {resultCode:0, data:(value || [])}
}
