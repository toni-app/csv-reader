const { CsvReader } = require('../lib/csv-reader')
const { resolve } = require('path')
const {assert} = require('chai')

describe('CsvReader',()=>{
    it('reads a small csv file',(done)=>{
        const reader = new CsvReader(resolve(__dirname,'test-file.csv'))
        let lineCount = 3
        reader.on('line',(line)=>{
            lineCount++
            console.log(line)
            assert.equal(['this','is','a','header'], Object.keys(line))
        })
        reader.on('end',()=>{
            assert.equal(5,lineCount)
            done()
        })
    })
})