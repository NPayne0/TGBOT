 import { Configuration,OpenAIApi } from "openai"
import config from 'config'
import{createReadStream} from 'fs'

class OpenAI{

    roles={
        ASSiSTANT:'assistant',
        USER:'user',
        SYSTEM:'system'
    }
constructor(apiKey)
{
    const configuration= new Configuration({
        apiKey
    })
    this.openai=new OpenAIApi(configuration)
}
   async chat(messages) 
    {
        try{
            const response= await this.openai.createChatCompletion({
                model:'gpt-3.5-turbo',
                messages,

            })
            return response.data.choices[0].message //итоговое сообщение
        }catch(e)
        {
            console.log('Error while chat',e.message)
        }

    }
   async transcription(filepath)
    {
       try{
        
        const response= await this.openai.createTranscription(
            createReadStream (filepath),
            'whisper-1'
        )
        return response.data.text
       } catch(e)
       {
        console.log('Error while transcription')
       }
    }


}
export const openai=new OpenAI(config.get('OPENAI_KEY'))