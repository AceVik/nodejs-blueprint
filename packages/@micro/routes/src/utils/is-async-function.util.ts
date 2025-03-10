const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

export const  isAsyncFunction =(fn: Function): boolean => fn instanceof AsyncFunction;