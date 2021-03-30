# csv-reader

Lightweight class used for parsing CSV files. This reader is implemented as an EventEmmiter wrapper over Node.js's ReadStream and can therefore parse CSV files of any size without running into memory problems.

## Usage

Import the CsvReader class from csv-reader

> new CsvReader(pathToFile, opts = {})

Currently the following options exist:

- maxLines (default = 0), defines a maximum number of lines to parse. If set to 0 will parse the entire file.
- skipLines (default = 0), defines a number of lines to skip.
- firstLineHeader (default = true), takes the first line of the file as the column header.
- delimiter (default = ","), defines a string as the field delimiter.

The following options are not yet implemented but are planned: line delimiter, field escape character. Currently \n is the default line delimiter and '"' is the field escape character.

The CsvReader class emits two different events:

- 'line', emits this event when a new line is parsed. The argument passed to the event is an object which contains either column names as keys (if the firstLineHeader option is set to true) or column indices as keys.
- 'end', emits this event when EOF is reached, or when maxLines is reached if it is set to 0.

Additionally, the pause() and resume() methods can be called to pause and resume the reading of the file respectively