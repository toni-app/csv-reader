const path = require('path')
const lineReader = require('./utils/line-reader')

const compoundCallback = (header, nextCallback) => {
    return (line)=>{
        let escaping = false
        let element = ''
        let position = 0
        const elements = {}
        for(char of line){
            if(char === '"') {
                escaping = !escaping
            }else if(char === ',' && !escaping){
                elements[header[position]] = element
                position++
                element = ''
            }else{
                element += char
            }
        }
        return nextCallback(elements)
    }
}

class CsvFile{
    constructor(pathToFile, firstLine, opts = {delimiter: ','}){
        this.absolutePath = pathToFile
        this.header = firstLine.split(opts.delimiter)
    }

    static async build(pathToFile){
        const absPath = path.resolve(__dirname,pathToFile)
        const firstLine = await lineReader.getFirstLine(absPath)
        return new CsvFile(pathToFile,firstLine)
    }

    readLineByLine(lineCallback,endCallback){
        const reader = lineReader.createLineStream(this.absolutePath,{skipLines: 1})

        reader.on('line',compoundCallback(this.header,lineCallback))
        reader.on('end',endCallback)
    }
}

module.exports = CsvFile