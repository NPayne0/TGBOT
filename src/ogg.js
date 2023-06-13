
import ffmpeg from 'fluent-ffmpeg'
import installer from '@ffmpeg-installer/ffmpeg'
import axios from "axios"
import {createWriteStream} from 'fs'
import {dirname,resolve} from 'path'
import {fileURLToPath} from 'url'
import { deleteFile } from './cleaning.js'


const __dirname=dirname(fileURLToPath(import.meta.url))// формируем путь


class oggconv{
    constructor(){
        ffmpeg.setFfmpegPath(installer.path)//при вызове конструктора указываем путь до конвертора 
    }
    toMP3(input,output){
        try{
            const outputPath=resolve(dirname(input),`${output}.mp3`)//путь до папки войсес
            return new Promise((resolve,reject)=>{
                ffmpeg(input)
                .inputOption('-t 30')
                .output(outputPath)
                .on('end',()=>{
                    deleteFile(input)
                    resolve(outputPath)
                })
                .on('errors',err=>reject(err.message))
                .run()
            })
        }catch(e){
            console.log('Error while creating mp3',e.message)
        }
    }
    async create(url, filename){
        try{
            const oggPath=resolve(__dirname, '../voices', `${filename}.ogg`)// теперь у нас есть путь
            const response= await axios({
                method: 'get', 
                url,
                responseType:'stream',
            })
            return new Promise(resolve=>{
                const stream=createWriteStream(oggPath)
                response.data.pipe(stream)
                stream.on('finish',()=>resolve(oggPath))
            })
           
        }catch(e){
            console.log('Error while creating ogg',e)
        }
       
    }


}
export const ogg=new oggconv()