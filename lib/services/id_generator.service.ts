import { nanoid } from "nanoid"

export const generateUniqueId=(title:string):string=>{
    const id=nanoid()
 return `${title}_${id}`
}