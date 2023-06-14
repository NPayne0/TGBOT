import {Telegraf, session} from 'telegraf'
import { message } from 'telegraf/filters'
import {code} from 'telegraf/format'
import config from 'config'
import {ogg} from './ogg.js'
import {openai} from './openai.js'


const INITIAL_SESSION={
    messages:[],
}
const bot=new Telegraf(config.get('TELEGRAM_TOKEN'))

bot.use(session())

bot.command('new',async(ctx)=>{
    ctx.session=INITIAL_SESSION
    await ctx.reply('Жду вашего голосового или текстового сообщения. Вы можете спросить как пишется слово в различных языках, а также например просто составить список чего-либо ')
})
bot.command('start',async(ctx)=>{
    ctx.session=INITIAL_SESSION
    await ctx.reply('Жду вашего голосового или текстового сообщения')
})

bot.on(message('voice'),async ctx=> {
    ctx.session ??=INITIAL_SESSION //если сессия не определилась, срабатывает если нулл или андефаинд
    try{ 

        await ctx.reply(code('Сообщение принял. Подождите немного, жду ответ от сервера...'))
       const link= (await ctx.telegram.getFileLink(ctx.message.voice.file_id))//получаем ссылку на гс которая начинает скачивать собственно саму гс с серверов ТГ в формате .ogg
       const userID=String(ctx.message.from.id)
       console.log(link.href)// url для скачки
       const oggPath=await ogg.create(link.href,userID)// локально создаем файл
       const mp3Path=await  ogg.toMP3(oggPath,userID)

       const text=await openai.transcription(mp3Path)
       await ctx.reply(code(`Ваш запрос : ${text}`))

       ctx.session.messages.push({role: openai.roles.USER, content:text})// пушим объект в массив 
       const response=await openai.chat(ctx.session.messages)

       ctx.session.messages.push({//сохраняется контекст переписки
        role: openai.roles.ASSiSTANT,
         content:response.content,
        })

       await ctx.reply(response.content)

    }catch(e){
        console.log('Error while voice recordering',e.message)
    }

    
})


bot.on(message('text'),async ctx=> {
    ctx.session ??=INITIAL_SESSION //если сессия не определилась, срабатывает если нулл или андефаинд
    try{ 
        await ctx.reply(code('Сообщение приянл. Подождите немного, жду ответ от сервера...'))
     

       ctx.session.messages.push({role: openai.roles.USER, content:ctx.message.text})// пушим объект в массив 
       const response=await openai.chat(ctx.session.messages)

       ctx.session.messages.push({//сохраняется контекст переписки
        role: openai.roles.ASSiSTANT,
         content:response.content,
        })

       await ctx.reply(response.content)

    }catch(e){
        console.log('Error while voice recordering',e.message)
    }

    
})


bot.launch()

process.once('SIGINT',()=>bot.stop('SIGINT'))
process.once('SIGTERM',()=>bot.stop('SIGTERM'))