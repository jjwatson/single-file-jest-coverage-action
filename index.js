const fs = require('fs');
const path = require('path');
const core = require('@actions/core');

const HTML_STRING = (cssContents, htmlBodyContents, jsContents) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Combined Report</title>
        <style>
            .coverage-summary .sorter {
                background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAbCAYAAACwRpUzAAAAUUlEQVR4AWNwL/CBYyAwRuajSMAwTAxFAl0BWAIXBunEifFKEjYWmwRBrxAMBJyYMq/8x4WhKjAlYMZiKMDllf+Uupb+kgS9QjAQcAYfwYAHAE7jpLivkXjUAAAAAElFTkSuQmCC") !important;
            }
            ${cssContents.join('\n')}
        </style>
    </head>
    <body>
        ${htmlBodyContents}
        <script>
            ${jsContents.join('\n')}
        </script>
    </body>
    </html>
`;

const doTheThings = async () => {
    try {
        const reportsDir = core.getInput('reports-path');
        const files = await fs.promises.readdir(reportsDir);

        const cssContents = await Promise.all(files
            .filter(file => file.endsWith('.css'))
            .map(filename => fs.promises.readFile(path.join(reportsDir, filename), { encoding: 'utf-8' })));

        const jsContents = await Promise.all(files
            .filter(file => file.endsWith('.js'))
            .map(filename => fs.promises.readFile(path.join(reportsDir, filename), { encoding: 'utf-8' })));

        const htmlContents = await fs.promises.readFile(path.join(reportsDir, 'index.html'), { encoding: 'utf-8' });
        const bodyStart = htmlContents.indexOf('<body>') + '<body>'.length;
        const bodyEnd = htmlContents.lastIndexOf('</body>');
        const htmlBodyContents = htmlContents.substring(bodyStart, bodyEnd);

        const htmlString = HTML_STRING(cssContents, htmlBodyContents, jsContents);

        await fs.promises.writeFile(path.join(reportsDir, 'combined-report.html'), htmlString, { encoding: 'utf-8' });
    } catch (error) {
        core.setFailed(error.message);
    }
};
doTheThings();

