const path = require('path')
const fs = require('fs')
const EventEmitter = require('events')

const defaultOpts = {maxLines: 0, skipLines: 0}

function createLineStream(pathToFile, opts){
    return new LineReader(pathToFile, opts)
}

async function getFirstLine(pathToFile){
    return new Promise((resolve)=>{
        const lineReader = new LineReader(pathToFile, {maxLines:1})
        lineReader.on('line',(chunk)=>{
            resolve(chunk.toString())
        })
    })
}

class LineReader extends EventEmitter{
    constructor(pathToFile, opts){
        super()
        opts = {...defaultOpts, ...opts}
        this.readStream = fs.createReadStream(path.resolve(__dirname,pathToFile))
        let leftOverChunk = ''
        let lines = 0
        this.readStream.on('data',(chunk)=>{
            let startSlice = 0
            let i
            for(i = 0; i<chunk.length; i++){
                //10 is \n value hardcoded (0x0A)
                //TODO: add functionality so EOL character can be chosen (CR, CRLF, LF) for now defaults to just LF
                if(chunk[i] === 0x0A){
                    const lineContent = leftOverChunk + chunk.slice(startSlice,i)
                    leftOverChunk=''
                    startSlice = i + 1
                    lines++
                    if(opts.skipLines < lines) {
                        this.emit('line',lineContent)
                    }

                    if(lines === opts.maxLines) {
                        this.readStream.close()
                        break
                    }
                }
            }
            if(i > startSlice){
                leftOverChunk += chunk.slice(startSlice,i)
            }
        })

        //send final chunk as last line
        this.readStream.on('end',()=>{
            if(leftOverChunk.length>0){
                this.emit('line',leftOverChunk)
            }
            this.emit('end')
        })
    }
}

module.exports = { createLineStream, getFirstLine }