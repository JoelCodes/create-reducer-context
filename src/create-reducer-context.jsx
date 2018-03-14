import React, {Component} from 'react';
import createContext from 'create-react-context';

const rando = (() => {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const alphabet = `0123456789${letters}${letters.toUpperCase()}`;
  const randoIter = (n = 10, acc = '') => {
    if(n <= 0) return acc;
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    return randoIter(n - 1, acc + alphabet[randomIndex]);
  };
  return randoIter();
});

export default function createReducerContext(reducer, preloadedStateOrMW, mw){
  if(typeof reducer !== 'function'){
    throw new TypeError('Reducer must be a function');
  }
  if(arguments.length > 2 && typeof mw !== 'function'){
    throw new TypeError('Middleware must be a function or undefined');
  }

  if(arguments.length === 2 && typeof preloadedStateOrMW === 'function'){
    return createReducerContext(reducer, reducer(undefined, {type: 'INIT'}), preloadedStateOrMW);
  }
  if(arguments.length === 1){
    return createReducerContext(reducer, reducer(undefined, {type: 'INIT'}));
  }
  
  const {
    Provider:ReduceContextProvider, 
    Consumer:ReduceContextConsumer,
  } = createContext();
  class Provider extends Component {
    state = preloadedStateOrMW
    update = (action) => {
      this.setState((state) => reducer(state, action));
    }
    store = {
      getState: () => this.state,
      dispatch: typeof mw === 'function' ?
        mw(this.store)(this.update) :
        this.update
    } 
    render(){
      return (<ReduceContextProvider value={this.store}>
        {this.props.children}
      </ReduceContextProvider>);
    }
  }
  function connect(mapStateToProps, mapDispatchToProps = () => ({})){
    return (InnerComponent) => () => {
      return (<ReduceContextConsumer>
        {({getState, dispatch}) =>  (<InnerComponent {...mapStateToProps(getState())} {...mapDispatchToProps(dispatch)}/>)}
      </ReduceContextConsumer>);
    };
  }

  return {connect, Provider};
}