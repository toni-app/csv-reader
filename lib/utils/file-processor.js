const path = require('path')
const fs = require('fs')
const CsvFile = require('../CsvFile')

async function processFile(pathToFile,lineAction,endAction){
    return new Promise(async (resolve)=>{
        const csvFile = await CsvFile.build(path.resolve(__dirname,pathToFile))
        csvFile.readLineByLine(lineAction,async ()=>{
            endAction()
            resolve()
        })
    })
}

module.exports = {processFile}