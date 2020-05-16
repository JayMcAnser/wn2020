

const sections = [
  {
    header: 'WatsNext import utility',
      content: 'Import the information from the mySQL database into the mongodb'
  },
  {
    header: 'Options',
      optionList: [
      {
        name: 'limit',
        alias: 'l',
        type: Number,
        description: 'Limit the number of records imported'
      },
      {
        name: 'help',
        alias: 'h',
        type: Boolean,
        description: 'Print this usage guide.'
      },
      {
        name: 'module',
        alias: 'm',
        type: String,
        multiple: true,
        description: 'Defines which modules are imported'
      },
      {
        name: 'session',
        alias: 's',
        type: String,
        description: 'Defines the session name to used for this import'
      },
      {
        name: 'clear',
        type: Boolean,
        description: 'Removes all records from the defined modules or if no modules are given, removes all modules from the db'
      }
    ]
  },
  {
    header: 'Configuration',
    content: 'The configuration is done by the files in the {bold ../config} directory. Standard the {bold command.json} is loaded.'
  },
  {
    content: '(c) MIT 2020 Lima / Jay. Version 0.1.0\n' +
      'Homepage: https://www.github.com/jaymcanser/watsnext2020'
  }
]


module.exports = sections;
