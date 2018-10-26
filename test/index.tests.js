/* eslint-env mocha */
import Loock from '../src/index.js';
import { fireKey, TAB_KEY, ESC_KEY } from './events.js';
import chai from 'chai/chai.js';

const expect = chai.expect;
let loock;

describe('Loock Tests', () => {

    before(() => {
        document.body.innerHTML =
            `<div aria-label="section" name="alphabet" class="loock alphabet">
                <button name="buttonA">A</button>
                <button name="buttonB">B</button>
                <button name="buttonC">C</button>
            </div>
            <div aria-label="section" name="numeric" class="loock numeric">
                <button name="button1">1</button>
                <button name="button2">2</button>
                <button name="button3">3</button>
            </div>`;

        document.body.setAttribute('aria-label', 'main');
        loock = new Loock();
        loock.createDefaultContext(document.body);
    });

    afterEach(() => {
        // reset all 3 levels of contexts so tests can start in a clean way.
        fireKey(window, ESC_KEY);
        fireKey(window, ESC_KEY);
        fireKey(window, ESC_KEY);
    });

    it('should initially focus on default context', async () => {
        expect(document.activeElement).to.equal(document.body);
    });

    it('should navigate within default context', async () => {
        fireKey(window, ESC_KEY);
        expect(document.activeElement).to.equal(document.body);
    });

    it('should navigate within one context', async () => {
        const alphabetDiv = document.querySelector('.alphabet');
        loock.createContext(alphabetDiv);

        fireKey(window, TAB_KEY);
        expect(document.activeElement).to.equal(alphabetDiv);
        fireKey(window, TAB_KEY);
        expect(document.activeElement).to.equal(document.querySelector('button[name="buttonA"]'));
        fireKey(window, TAB_KEY);
        expect(document.activeElement).to.equal(document.querySelector('button[name="buttonB"]'));
        fireKey(window, TAB_KEY);
        expect(document.activeElement).to.equal(document.querySelector('button[name="buttonC"]'));
        fireKey(window, TAB_KEY);
        expect(document.activeElement).to.equal(document.querySelector('button[name="buttonA"]'));
        fireKey(window, ESC_KEY);
        expect(document.activeElement).to.equal(alphabetDiv);
    });

    it('should navigate within contexts', async () => {
        const alphabetDiv = document.querySelector('.alphabet');
        loock.createContext(alphabetDiv);

        const numericDiv = document.querySelector('.numeric');
        loock.createContext(numericDiv);

        fireKey(window, TAB_KEY);
        expect(document.activeElement).to.equal(alphabetDiv);
        fireKey(window, TAB_KEY);
        expect(document.activeElement).to.equal(document.querySelector('button[name="buttonA"]'));
        fireKey(window, ESC_KEY);
        expect(document.activeElement).to.equal(alphabetDiv);
        fireKey(window, ESC_KEY);
        expect(document.activeElement).to.equal(alphabetDiv);
        fireKey(window, TAB_KEY);
        expect(document.activeElement).to.equal(document.querySelector('button[name="buttonA"]'));
        fireKey(window, TAB_KEY);
        expect(document.activeElement).to.equal(document.querySelector('button[name="buttonB"]'));
        fireKey(window, TAB_KEY);
        expect(document.activeElement).to.equal(document.querySelector('button[name="buttonC"]'));
        fireKey(window, TAB_KEY);
        expect(document.activeElement).to.equal(numericDiv);
        fireKey(window, TAB_KEY);
        expect(document.activeElement).to.equal(document.querySelector('button[name="button1"]'));
        fireKey(window, ESC_KEY);
        expect(document.activeElement).to.equal(numericDiv);
        fireKey(window, ESC_KEY);
        expect(document.activeElement).to.equal(numericDiv);
        fireKey(window, ESC_KEY);
        expect(document.activeElement).to.equal(document.body);
    });
});
