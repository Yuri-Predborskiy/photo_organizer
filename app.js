'use strict';

const helper = require('./helper');

// todo: read params from external file
// todo: add readme, .example for json parameter file
let params = {
    sources: [ // list of folders to collect images from, with optional parameters
        { path: 'test/in/camera', timeShift: (-60 + 9)*60*1000 }, // -1 hour + 9 minutes, in ms
        { path: 'test/in/mobile' },
    ],
    target: 'test/out', // folder to output
    extensions: ['.jpg'], // skip files whose extension is not listed here
    filenameFormat: {
        separator: '_', // used for naming a file
        prefix: 'MyTour',
        body: 'YYYYMMDD_HHmmss', // determines date format for moment.js
        suffix: '50' // optional suffix for new name
    }
};

function readAllFiles() {
    console.log('Starting to read data from files');
    let fileList = [];
    for (let i = 0; i < params.sources.length; i++) {
        let source = params.sources[i];
        let dir = source.path;
        let files = helper.getImageFilesInPath(dir, params.extensions);
        files.map((filename, index) => {
            let creationDate = helper.getDateTimeString(`${dir}/${filename}`, source.timeShift, params.filenameFormat.body);
            fileList.push({ dir, filename, creationDate });
            console.log(`Processing folder ${dir}, found file ${filename}, ${index + 1}/${files.length}`);
        });
    }
    return fileList;
}

let files = readAllFiles();
files.sort(helper.sortByCreationDate);
for (let i = 0, index = 0, date = null; i < files.length; i++) {
    let fileDate = files[i].creationDate.split(params.filenameFormat.separator)[0];
    if (date !== fileDate) {
        date = fileDate;
        index = 0;
    } else {
        index++;
    }
    files[i].newName = helper.getNewFilename({
        oldFilename: files[i].filename,
        date: files[i].creationDate,
        format: params.filenameFormat,
        index
    });
}
// console.log(files); // for the record - what files were renamed into what
console.log('Starting renaming process');
// comment next line to skip processing files, for example if you only want to log result
helper.renameFiles(files, params.target);
console.log('All done!');
