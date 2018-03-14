/* eslint-env jest */
/* eslint react/prop-types:"off" */
import {expect} from 'chai';
import {configure, mount} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';

import {createReducerContext} from '../src';

configure({adapter: new Adapter()});

describe('#createReducerContext(reducer[, preloadedState][, middleware])', () => {
  describe('parameter errors', () => {
    it('throws an error if there are no parameters or the first is not a function', () => {
      expect(() => {
        createReducerContext();
      }).to.throw(TypeError, /reducer.*function/gi);
      expect(() => {
        createReducerContext({});
      }).to.throw(TypeError, /reducer.*function/gi);
    });
    it('throws an error if the third parameter is not a function', () => {
      expect(() => {
        createReducerContext(() => {}, {}, {});
      }).to.throw(TypeError, /middleware.*function/gi);
    });
  });

  // Assets to reuse for tests.
  const initialState = {count: 0};
  const incrementReducer = (state = initialState, action) => action.type === 'INC' ? {count: state.count + 1} :state;
  const incrementAction = {type: 'INC'};
  const mapStateToProps = ({count}) => ({count});
  const Displayer = ({count}) => <span>Count: {count}</span>;

  const mapDispatchToProps = (dispatch) => ({increment: () => {
    dispatch(incrementAction);
  }});
  const Clicker = ({increment}) => <button onClick={increment}>Increment</button>;

  it('takes in a reducer and preloadedState and returns a Provider and connect', () => {
    const {connect, Provider} = createReducerContext(incrementReducer, {count: -1});
    const ConnectedDisplayer = connect(mapStateToProps)(Displayer);
    const wrapper = mount(<Provider>
      <ConnectedDisplayer />
    </Provider>);
    expect(wrapper.find('span').text()).to.eq('Count: -1');
  });

  it('takes in a reducer and derives the preloadedState.', () => {
    const {connect, Provider} = createReducerContext(incrementReducer);
    const ConnectedDisplayer = connect(mapStateToProps)(Displayer);
    const wrapper = mount(<Provider>
      <ConnectedDisplayer />
    </Provider>);
    expect(wrapper.find('span').text()).to.eq('Count: 0');    
  });
  it('changes in response to actions', () => {
    const {connect, Provider} = createReducerContext(incrementReducer);
    const ConnectedDisplayer = connect(mapStateToProps)(Displayer);
    const ConnectedClicker = connect(() => ({}), mapDispatchToProps)(Clicker);
    const wrapper = mount(<Provider>
      <ConnectedDisplayer />
      <ConnectedClicker />
    </Provider>);
    expect(wrapper.find('span').text()).to.eq('Count: 0');    
    wrapper.find('button').simulate('click');
    expect(wrapper.find('span').text()).to.eq('Count: 1');    
  });

  describe('middleware', () => {
    it('lets a flow-through middleware work unimpeded', () => {
      const playThrough = () => next => action => next(action);
      const {connect, Provider} = createReducerContext(incrementReducer, playThrough);
      const ConnectedDisplayer = connect(mapStateToProps)(Displayer);
      const ConnectedClicker = connect(() => ({}), mapDispatchToProps)(Clicker);
      const wrapper = mount(<Provider>
        <ConnectedDisplayer />
        <ConnectedClicker />
      </Provider>);
      expect(wrapper.find('span').text()).to.eq('Count: 0');    
      wrapper.find('button').simulate('click');
      expect(wrapper.find('span').text()).to.eq('Count: 1');          
    });
    it('makes no change on a blocking middleware', () => {
      const blocking = () => () => () => {};
      const {connect, Provider} = createReducerContext(incrementReducer, blocking);
      const ConnectedDisplayer = connect(mapStateToProps)(Displayer);
      const ConnectedClicker = connect(() => ({}), mapDispatchToProps)(Clicker);
      const wrapper = mount(<Provider>
        <ConnectedDisplayer />
        <ConnectedClicker />
      </Provider>);
      expect(wrapper.find('span').text()).to.eq('Count: 0');    
      wrapper.find('button').simulate('click');
      expect(wrapper.find('span').text()).to.eq('Count: 0');
    });
    it('permits async middleware', async () => {
      const delay = (t) => new Promise(resolve => setTimeout(resolve, t));
      const waiting = () => (next) => async (action) => {
        await delay(100);
        next(action);
      };
      const {connect, Provider} = createReducerContext(incrementReducer, waiting);
      const ConnectedDisplayer = connect(mapStateToProps)(Displayer);
      const ConnectedClicker = connect(() => ({}), mapDispatchToProps)(Clicker);
      const wrapper = mount(<Provider>
        <ConnectedDisplayer />
        <ConnectedClicker />
      </Provider>);
      expect(wrapper.find('span').text()).to.eq('Count: 0');    
      wrapper.find('button').simulate('click');
      expect(wrapper.find('span').text()).to.eq('Count: 0'); 
      await delay(1000);
      expect(wrapper.find('span').text()).to.eq('Count: 1');    
    });

    it('permits the middleware access to the store state', () => {

      let firstState;
      const storeMw = (store) => (next) => (action) => {
        firstState = store.getState();
        next(action);
      };

      const {connect, Provider} = createReducerContext(incrementReducer, {count: -1}, storeMw);
      const ConnectedDisplayer = connect(mapStateToProps)(Displayer);
      const ConnectedClicker = connect(() => ({}), mapDispatchToProps)(Clicker);
      const wrapper = mount(<Provider>
        <ConnectedDisplayer />
        <ConnectedClicker />
      </Provider>);

      expect(wrapper.find('span').text()).to.eq('Count: -1');    
      wrapper.find('button').simulate('click');
      expect(wrapper.find('span').text()).to.eq('Count: 0');
      expect(firstState).to.deep.eq({count: -1});
    });

    it('permits the middleware to access the store dispatch', () => {
      const triggerMW = (store) => (next) => (action) => {
        if(action.type === 'TRIGGER'){
          store.dispatch(incrementAction);
        } else {
          next(action);
        }
      };

      const {connect, Provider} = createReducerContext(incrementReducer, {count: -1}, triggerMW);
      const ConnectedDisplayer = connect(mapStateToProps)(Displayer);
      const mapDispatchToProps = (dispatch) => ({
        increment: () => dispatch({type: 'TRIGGER'}) 
      });

      const ConnectedClicker = connect(() => ({}), mapDispatchToProps)(Clicker);
      const wrapper = mount(<Provider>
        <ConnectedDisplayer />
        <ConnectedClicker />
      </Provider>);

      expect(wrapper.find('span').text()).to.eq('Count: -1');    
      wrapper.find('button').simulate('click');
      expect(wrapper.find('span').text()).to.eq('Count: 0');
      
    });
  });
});
