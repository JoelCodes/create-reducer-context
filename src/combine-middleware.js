export default function combineMiddleware(mw, ...mws){
  if(arguments.length === 0){
    return () =>(next) => (action) => {
      next(action);
    };  
  }
  
  if(typeof mw !== 'function'){
    return combineMiddleware(...mws);
  }
  
  if(mws.length === 0){
    return mw;
  }

  return store => next => action => {
    mw(store)(combineMiddleware(...mws)(store)(next))(action);
  };
  
}