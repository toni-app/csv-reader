const path = require('path')
const fs = require('fs')
const EventEmitter = require('events')

const defaultOpts = {maxLines: 0, skipLines: 0, firstLineHeader: true, delimiter: ','}

class CsvReader extends EventEmitter{
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
                        if(lines === 1 && opts.firstLineHeader === true){
                            this.header = lineContent.split(opts.delimiter)
                        }else{
                            this.emit('line',this.parseLine(lineContent))
                        }
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

        this.readStream.on('pause',()=>{
            //console.log("Paused stream!")
        })

        //send final chunk as last line
        this.readStream.on('end',()=>{
            if(leftOverChunk.length>0){
                this.emit('line',leftOverChunk)
            }
            this.emit('end')
        })
    }

    parseLine(line){
        let escaping = false
        let element = ''
        let position = 0
        const elements = {}
        for(const char of line){
            if(char === '"') {
                escaping = !escaping
            }else if(char === ',' && !escaping){
                elements[this.header[position]] = element
                position++
                element = ''
            }else{
                element += char
            }
        }
        return elements
    }

    pause(){
        this.readStream.pause()
    }

    resume(){
        this.readStream.resume()
    }
}

module.exports = { CsvReader }