import yargs from 'yargs';
import generator from "./generator";

yargs
    .command(
        'generate [database] [numberOfRecords]',
        'generates records for testing',
        (yargs) => {
            yargs
                .positional('database', {
                    describe: 'Database Name'
                })
                .positional('numberOfRecords', {
                    describe: 'Number of database records to generate',
                    type: 'integer'
                })
        },
        (argv) => {
            generator(argv).generateRecords(argv.numberOfRecords)
        }
    )
    .command(
        'suggest [database] [keyword]',
        'generates records for testing',
        (yargs) => {
            yargs
                .positional('database', {
                    describe: 'Database Name'
                })
                .positional('keyword', {
                    describe: 'search keyword'
                })
        },
        (argv) => {
            generator(argv).suggestKeywords(argv.keyword)
        }
    )

    .option('host', {
        alias: 't',
        description: 'Database Hostname',
        default: '127.0.0.1'
    })
    .option('user', {
        alias: 'u',
        description: 'Database Username',
        default: 'root'
    })
    .option('password', {
        alias: 'p',
        description: 'Database password',
        default: 'tests'
    })
.demandCommand()
.argv