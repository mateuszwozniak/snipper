var config = module.exports;

config['web-module'] = {
    autoRun     : false,
    rootPath    : '..',
    environment : 'browser',
    sources     : [
        '../../require.js',
    ],
    resources: [
        '*.js', 
        'test/*.js', 
        'test/data/*.snippets'
    ],
    tests : [
        'test/async-modules-config.js'
    ]
};
