// helper file for reading EXIF data from file
'use strict';

global.DOMParser = global.DOMParser || require('xmldom').DOMParser;
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const ExifReader = require('exifreader');

const NUMBER_LENGTH = 4;

// date time string is used for sorting and includes both date and time
function getDateTimeString(filename, timeShift, format) {
    let datetime = moment(getDateTimeOriginal(filename), 'YYYY:MM:DD HH:mm:ss');
    if (timeShift) {
        datetime.add(timeShift, 'ms');
    }
    return datetime.format(format);
}

// read date time original from exif metadata
function getDateTimeOriginal(filename) {
    try {
        let data = fs.readFileSync(filename);
        let tags;
        // if exif exists - read data, otherwise return original file name, it will turn into invalid data
        try {
            tags = ExifReader.load(data.buffer);
        } catch(e) {
            tags = {};
        }
        return tags['DateTimeOriginal'] ? tags['DateTimeOriginal'].description : 'original-' + filename;
    }
    catch (error) {
        console.error(error);
    }
    return '';
}

function getImageFilesInPath(path, extensions) {
    let files = fs.readdirSync(path);
    return files.filter(file => {
        let isDir = fs.lstatSync(path + '/' + file).isDirectory();
        let ext = getFileExtension(file);
        if (!isDir && !!ext) {
            return extensions.includes(ext.toLowerCase());
        }
        return false;
    });
}

function getFileExtension(filename) {
    return path.extname(filename);
}

function sortByCreationDate(a, b) {
    if (a.creationDate > b.creationDate) {
        return 1;
    } else {
        return -1;
    }
}

function numberToString(n, length) {
    n = '' + n;
    while (n.length < length) {
        n = '0' + n;
    }
    return n;
}

// keep date, remove time, add prefix and suffix
function getNewFilename({oldFilename, date, format, index = 1}) {
    let prefix = format.prefix ? format.prefix + format.separator : '';
    let suffix = format.suffix ? format.separator + format.suffix : '';
    let body = date.split(format.separator)[0] + format.separator + numberToString(index + 1, NUMBER_LENGTH);
    return prefix + body + suffix + getFileExtension(oldFilename).toLowerCase();
}

function renameFiles(files, target) {
    files.map(file => {
        fs.renameSync(file.dir + '/' + file.filename, target + '/' + file.newName);
    });
}

module.exports = {
    getNewFilename,
    getDateTimeString,
    getImageFilesInPath,
    sortByCreationDate,
    renameFiles,
};