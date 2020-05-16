/**
 * command to import all artwork into the system
 *
 * version 0.0.1 Jay 2020-05-15
 */

const DbMongo = require('./init').DbMongo;
const DbMySql = require('./init').DbMySQL;

// const Config = require('config');
const InfoSections = require('./command-line-help');
const Logging = require('../lib/logging');
const commandLineArgs = require('command-line-args')
const CommandLineUsage = require('command-line-usage');
const Session = require('../lib/session');
const ArtImport = require('../import/art-import');
const CarrierImport = require('../import/carrier-import');
const CodeImport = require('../import/code-import');
const AgentImport = require('../import/agent-import');
const ContactImport = require('../import/contact-import');
const LocationImport = require('../import/location-import');

const Options = commandLineArgs(InfoSections[1].optionList);

const run = async function() {
  if (Options.help) {
    console.log(CommandLineUsage(InfoSections));
  } else {
    await DbMongo.connect();
    await DbMySql.connect();
    let options = {}
    if (Options.limit) {
      options.limit = Options.limit
    }
    if (!Options.module || Options.module.length === 0) {
      Options.module = ['agent', 'art', 'carrier', 'contact', 'code', 'distribution', 'history'];
    }
    if (Options.clear) {
      await removeAllRecords(Options.module)
    }
    for (let l = 0; l < Options.module.length; l++) {
      let importRunner = false;
      switch(Options.module[l].toLowerCase()) {
        case 'art':
          options.session = new Session(Options.session ? Options.session : 'import-art');
          importRunner = new ArtImport(options);
          break;
        case 'carrier':
          options.session = new Session(Options.session ? Options.session : 'import-carrier');
          importRunner = new CarrierImport(options);
          break;
        case 'contact':
          options.session = new Session(Options.session ? Options.session : 'import-contact');
          importRunner = new ContactImport(options);
          break;
        case 'agent':
          options.session = new Session(Options.session ? Options.session : 'import-agent');
          importRunner = new AgentImport(options);
          break;
        case 'code':
          options.session = new Session(Options.session ? Options.session : 'import-code');
          importRunner = new CodeImport(options);
          break;
        case 'distribution':
          options.session = new Session(Options.session ? Options.session : 'import-distribution');
          importRunner = new LocationImport(options);
          break;
        case 'history' :
          break;
        default:
          let err = `unknown module name: ${Options.module[l]} Possible values are: art, carrier, agent, code, contact, distribution`
          Logging.error(err);
          console.error(err);
      }
      if (importRunner) {
        Logging.info(`importing: ${Options.module[l]}`);
        await importRunner.run(DbMySql, options)
      }
    }
  }
  process.exit(0)
}

const removeAllRecords = async function(modules) {
  let con = await DbMongo.connect();
  for (let l = 0; l < modules.length; l++) {
    let name = modules[l];
    name = name[0].toUpperCase() + name.substr(1);
    if (con.models[name]) {
      let Model = con.models[name]
      await Model.deleteMany({});
    }
  }
  return Promise.resolve();
}

run();

