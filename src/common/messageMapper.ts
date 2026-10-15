import { localeResolver } from "./localeResolver.js";
import { validationMessages } from "./validation-messages.js";

export type invalidParamsType= {
      name: string;
      reason: string;
    }[]
export const messageMapper=(invalidParams:invalidParamsType,language:string|undefined)=>{
     const locale=localeResolver(language)
    
    const dictionary=validationMessages[locale]
    const translatedInvalidParams = invalidParams.map(({ name, reason }) => {
      const [field,value]=reason.split('.')
      const fieldMsgs=dictionary[field as keyof typeof dictionary]
      const msg=fieldMsgs[value as keyof typeof fieldMsgs]
    return{name:field,reason:msg} 
    
})
return translatedInvalidParams
}