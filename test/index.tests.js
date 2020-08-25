import { Loock, TAB_KEY, ESC_KEY } from '../src/index.js';
import { fireKey } from './events.js';

let loock;

describe('Loock Tests', function() {
    this.timeout(10 * 1000);

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

    afterEach(async () => {
        // reset all 3 levels of contexts so tests can start in a clean way.
        await fireKey(window, ESC_KEY);
        await fireKey(window, ESC_KEY);
        await fireKey(window, ESC_KEY);
    });

    it('should initially focus on default context', () => {
        expect(document.activeElement).to.equal(document.body);
    });

    it('should navigate within default context', async () => {
        await fireKey(window, ESC_KEY);
        expect(document.activeElement).to.equal(document.body);
    });

    it('should navigate within one context', async () => {
        const alphabetDiv = document.querySelector('.alphabet');
        loock.createContext(alphabetDiv);

        await fireKey(window, TAB_KEY);
        expect(document.activeElement).to.equal(alphabetDiv);
        await fireKey(window, TAB_KEY);
        expect(document.activeElement).to.equal(document.querySelector('button[name="buttonA"]'));
        await fireKey(window, TAB_KEY);
        expect(document.activeElement).to.equal(document.querySelector('button[name="buttonB"]'));
        await fireKey(window, TAB_KEY);
        expect(document.activeElement).to.equal(document.querySelector('button[name="buttonC"]'));
        await fireKey(window, TAB_KEY);
        expect(document.activeElement).to.equal(document.querySelector('button[name="buttonA"]'));
        await fireKey(window, ESC_KEY);
        expect(document.activeElement).to.equal(alphabetDiv);
    });

    it('should navigate within contexts', async () => {
        const alphabetDiv = document.querySelector('.alphabet');
        loock.createContext(alphabetDiv);

        const numericDiv = document.querySelector('.numeric');
        loock.createContext(numericDiv);

        await fireKey(window, TAB_KEY);
        expect(document.activeElement).to.equal(alphabetDiv);
        await fireKey(window, TAB_KEY);
        expect(document.activeElement).to.equal(document.querySelector('button[name="buttonA"]'));
        await fireKey(window, ESC_KEY);
        expect(document.activeElement).to.equal(alphabetDiv);
        await fireKey(window, ESC_KEY);
        expect(document.activeElement).to.equal(alphabetDiv);
        await fireKey(window, TAB_KEY);
        expect(document.activeElement).to.equal(document.querySelector('button[name="buttonA"]'));
        await fireKey(window, TAB_KEY);
        expect(document.activeElement).to.equal(document.querySelector('button[name="buttonB"]'));
        await fireKey(window, TAB_KEY);
        expect(document.activeElement).to.equal(document.querySelector('button[name="buttonC"]'));
        await fireKey(window, TAB_KEY);
        expect(document.activeElement).to.equal(numericDiv);
        await fireKey(window, TAB_KEY);
        expect(document.activeElement).to.equal(document.querySelector('button[name="button1"]'));
        await fireKey(window, ESC_KEY);
        expect(document.activeElement).to.equal(numericDiv);
        await fireKey(window, ESC_KEY);
        expect(document.activeElement).to.equal(numericDiv);
        await fireKey(window, ESC_KEY);
        expect(document.activeElement).to.equal(document.body);
    });
});
