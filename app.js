'use strict';

const helper = require('./helper');

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
    let fileList = [];
    for (let i = 0; i < params.sources.length; i++) {
        let source = params.sources[i];
        let dir = source.path;
        let files = helper.getImageFilesInPath(dir, params.extensions);
        files.map(filename => {
            let creationDate = helper.getDateTimeString(`${dir}/${filename}`, source.timeShift, params.filenameFormat.body);
            fileList.push({ dir, filename, creationDate });
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
console.log(files); // for the record - what files were renamed into what

// comment next line to see if files would be processed properly
helper.renameFiles(files, params.target);
