require({
    paths: {
        'ext/snipper': '.'
    }
}, [
    'test/marker-test',
    'test/parser-test',
    'test/snippet-test',
    'test/manager-test'
], function () {
    buster.run();
});
