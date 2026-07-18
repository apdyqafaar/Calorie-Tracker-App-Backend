import { nanoid } from "nanoId"
export const generateUniqueId=(title:string):string=>{
    const id=nanoid()
 return `${title}_${id}`
}