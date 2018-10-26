import Loock from '../src/index.js';

const loock = new Loock();

const callback = (loockContext) => {
    document.querySelector('.active-context-red').innerHTML = `${loockContext.root.getAttribute('name')} context`;
};

const defaultContext = loock.createDefaultContext(document.body);
const contextAlphabet = loock.createContext(document.querySelector('.alphabet'));
const contextNumeric = loock.createContext(document.querySelector('.numeric'));

const contexts = [defaultContext, contextAlphabet, contextNumeric];
contexts.forEach((context) => {
    context.on('enter', () => callback(context));
});
